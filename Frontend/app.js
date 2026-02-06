document.addEventListener('DOMContentLoaded', () => {
    // User Dropdown Logic
    const userAvatar = document.querySelector('.user-avatar');
    const dropdown = document.querySelector('.user-dropdown');

    if (userAvatar && dropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !userAvatar.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // --- APP NAVIGATION LOGIC ---
    // If we are on index.html, we handle view switching.
    // If we are on other pages (favorites/movies), we don't need this specific logic 
    // unless we want to redirect to index.html#profile-view on logout.

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Check if we already have a session active (optional enhancement)
    // For now, we default to profile view.
});

// Exposed functions for onclick events
function enterApp() {
    const profileView = document.getElementById('profile-view');
    const homeView = document.getElementById('home-view');

    if (profileView && homeView) {
        profileView.classList.add('hidden'); // Or style.display = 'none'
        // We used position:fixed for profile view, so hiding it is enough.
        // But for clearer state:
        profileView.style.display = 'none';

        homeView.classList.remove('hidden');
        homeView.classList.add('flex'); // Restore flex layout

        // Trigger load if needed (though it runs on load already)
        // LoadMovies(); 
    } else {
        // If not on index.html (e.g. user refreshed while on home.html content in memory?),
        // Just redirect to index.html would be the fallback if we were multi-page.
        // Since we are SPA now for Home, this function mostly runs there.
    }
}

function logout() {
    const profileView = document.getElementById('profile-view');
    const homeView = document.getElementById('home-view');

    if (profileView && homeView) {
        homeView.classList.add('hidden');
        homeView.classList.remove('flex');

        profileView.style.display = 'flex'; // Restore flex for centering
    } else {
        // If on another page, redirect to index
        window.location.href = '../index.html';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize favorites from localStorage
    // We store an array of movie objects: { title, image, rating, duration }
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // 2. Select all favorite buttons
    const favButtons = document.querySelectorAll('.fav-btn');

    // Helper: Extract movie data from button attributes
    const getMovieData = (btn) => {
        return {
            title: btn.dataset.title,
            photo_url: btn.dataset.photo_url,
            release_year: btn.dataset.release_year,
            duration_min: btn.dataset.duration_min,
            summary: btn.dataset.summary,
            is_series: parseInt(btn.dataset.is_series)
        };
    };

    // 3. Define the toggle function
    const toggleFavorite = async (btn) => {
        const title = btn.dataset.title;
        const index = favorites.findIndex(f => f.title === title);

        if (index !== -1) {
            // Remove from favorites
            favorites.splice(index, 1);
            updateButtonState(btn, false);
        } else {
            // Add to favorites
            try {
                const response = await fetch(API);
                if (!response.ok) throw new Error("API error");
                const data = await response.json();
                const movie = data.movies.find(m => m.title === title);

                if (movie) {
                    // Extract just the filename for consistency with local paths
                    const fileName = movie.photo_url ? movie.photo_url.split('/').pop() : "";
                    const cleanedMovie = {
                        ...movie,
                        photo_url: `MoviesImagenes/${fileName}`
                    };
                    favorites.push(cleanedMovie);
                    updateButtonState(btn, true);
                } else {
                    console.warn('Movie not found in API');
                }
            } catch (error) {
                console.error("Error fetching movie data:", error);
            }
        }

        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Sync other buttons for the same movie
        syncAllButtons(title, index === -1);
    };

    // 4. Update button visual state
    const updateButtonState = (btn, isFavorite) => {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (isFavorite) {
            icon.textContent = 'favorite';
            icon.classList.add('text-red-500', 'fill-current');
            btn.classList.add('text-red-500');
            btn.classList.remove('text-slate-400');
        } else {
            icon.textContent = 'favorite_border';
            icon.classList.remove('text-red-500', 'fill-current');
            btn.classList.remove('text-red-500');
            btn.classList.add('text-slate-400');
        }
    };

    // 5. Sync all buttons with the same title
    const syncAllButtons = (title, isFavorite) => {
        const currentButtons = document.querySelectorAll('.fav-btn');
        currentButtons.forEach(btn => {
            if (btn.dataset.title === title) {
                updateButtonState(btn, isFavorite);
            }
        });
    };

    // 6. Use event delegation for favorites
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.fav-btn');
        if (btn) {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(btn);
        }
    });

    // Initial sync of buttons (rarely needed for dynamic grid, but good to have)
    const initButtons = () => {
        const btns = document.querySelectorAll('.fav-btn');
        btns.forEach(btn => {
            const title = btn.dataset.title;
            const isFav = favorites.some(f => f.title === title);
            updateButtonState(btn, isFav);
        });
    };
});

const API =
    "https://silver-chainsaw-7v4q6wwrw77vh4x7-3000.app.github.dev/api/movies";
const $contenedor = document.querySelector(".movies-grid");
const $continueWatching = document.getElementById("continue-watching-container");
const $newReleases = document.getElementById("new-releases-container");
const $searchInput = document.querySelector(".search-input");

// Global state to store all fetched movies
let allMoviesData = [];
let currentGenreId = null;

// --- FUNCIÓN PRINCIPAL DE CARGA ---
async function LoadMovies(genreId = null) {
    if (!$contenedor) return;

    currentGenreId = genreId; // Store current genre context

    try {
        // If we already have data and are just filtering by genre, we might not strictly need to refetch 
        // if we had *all* movies, but the API endpoint changes based on genreId, so we maintain the fetch.
        const fetchUrl = genreId ? `${API}/${genreId}` : API;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Error en la respuesta de la API");

        const data = await response.json();
        allMoviesData = data.movies; // Store raw data

        // Initial render with current search term (likely empty initially)
        applyFiltersAndRender();

    } catch (error) {
        console.error("Error al cargar:", error);
        $contenedor.innerHTML = `<p class="error">Error al cargar la base de datos.</p>`;
    }
}

// --- FILTER & RENDER LOGIC ---
function applyFiltersAndRender() {
    if (!$contenedor) return;

    const searchTerm = $searchInput ? $searchInput.value.toLowerCase().trim() : "";
    const path = window.location.pathname;
    const esHome = path.endsWith("home.html") || path.endsWith("index.html") || path === "/" || path === "" || path.includes("index");
    const esPaginaSeries = path.includes("series.html");
    const esPaginaPeliculas = path.includes("allMovies");

    const filtrados = allMoviesData.filter((item) => {
        // 1. Page/Category Logic
        // Note: API already filters by genre if currentGenreId was set during LoadMovies fetch.
        // We only enforce additional client-side checks if needed.
        let matchPage = true;
        if (esHome) matchPage = true;
        else if (esPaginaSeries) matchPage = item.is_series === 1;
        else if (esPaginaPeliculas) matchPage = true;

        // 2. Search Logic
        const matchSearch = item.title.toLowerCase().includes(searchTerm);

        return matchPage && matchSearch;
    });

    renderMovies(filtrados);
}

function renderMovies(movies) {
    let htmlTemplate = "";

    movies.forEach((peli) => {
        // Extract filename from database path and construct local path
        const nombreArchivo = peli.photo_url ? peli.photo_url.split('/').pop() : "";
        const rutaImagenLocal = `MoviesImagenes/${nombreArchivo}`;

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFav = favorites.some(f => f.title === peli.title);
        const favIcon = isFav ? 'favorite' : 'favorite_border';
        const favClass = isFav ? 'text-red-500 fill-current' : 'text-slate-400';

        htmlTemplate += `
            <div class="movie-card">
                <a href="movies/movie_details.html?id=${peli.id}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                    <div class="poster-image" style="background-image: url('${rutaImagenLocal}')"></div>

                    <div class="movie-popover">
                        <div class="popover-thumb" style="background-image: url('${rutaImagenLocal}')"></div>
                        <div class="popover-content">
                            <div class="movie-title-row">
                                <h3 class="movie-title">${peli.title}</h3>
                                <button class="fav-btn ${favClass}" data-title="${peli.title}">
                                    <span class="material-symbols-outlined">${favIcon}</span>
                                </button>
                            </div>
                            <div class="meta-row">
                                <span>${peli.release_year}</span>
                                <span class="rating-badge">HD</span>
                                <span>${peli.duration_min} min</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });

    $contenedor.innerHTML = htmlTemplate || '<p class="text-center w-full py-10 opacity-50">No matching movies found.</p>';

    // Re-initialize favorite buttons for the newly rendered elements
    // We can rely on the event delegation in 'DOMContentLoaded', but if we wanted to
    // explicitly re-bind anything, we would do it here. 
    // Since we use delegation (document.addEventListener('click', ... .fav-btn)), we are safe.
}

// --- EVENT LISTENERS ---

// Search Input Listener
// Search Input Listener
if ($searchInput) {
    $searchInput.addEventListener("input", (e) => {
        const path = window.location.pathname;
        const isHomePage = path.endsWith("home.html") || path.endsWith("index.html") || path === "/" || path === "" || path.includes("index");

        if (isHomePage) {
            const val = e.target.value;
            if (val.trim().length > 0) {
                // Redirect to allMovies with search param
                // Assuming relative path from home.html is ./allMovies/allMovies.html
                // But from index.html (if root) it might be ./allMovies/allMovies.html
                // Let's use absolute path-ish or relative that works for both if they are in same dir level?
                // home.html is in Frontend/. allMovies is in Frontend/allMovies/.
                // So path is allMovies/allMovies.html
                window.location.href = `allMovies/allMovies.html?search=${encodeURIComponent(val)}`;
            }
        } else {
            // Normal filtering for other pages (like allMovies itself)
            applyFiltersAndRender();
        }
    });
}

// Brand Filter Listeners
const brandCards = document.querySelectorAll('.brand-card');
brandCards.forEach(card => {
    card.addEventListener('click', () => {
        // Toggle active visual state
        brandCards.forEach(c => {
            c.classList.remove('border-primary');
            c.querySelector('span').classList.remove('text-primary');
            c.querySelector('span').classList.add('group-hover:text-primary');
        });

        card.classList.add('border-primary');
        const span = card.querySelector('span');
        span.classList.add('text-primary');
        span.classList.remove('group-hover:text-primary');

        const genreId = card.dataset.genreId;
        LoadMovies(genreId);

        // Scroll to grid
        $contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Navigation "Home" link should clear filter
const homeLink = document.querySelector('.nav-link[href="home.html"]');
if (homeLink) {
    homeLink.addEventListener('click', (e) => {
        if (window.location.pathname.endsWith('home.html')) {
            e.preventDefault();
            brandCards.forEach(c => {
                c.classList.remove('border-primary');
                c.querySelector('span').classList.remove('text-primary');
            });
            // Clear search as well when resetting home
            if ($searchInput) $searchInput.value = "";
            LoadMovies();
        }
    });
}

// --- FUNCIONES PARA CARRUSELES ---
async function LoadCarouselMovies() {
    if (!$continueWatching && !$newReleases) return;

    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Error en la respuesta de la API");

        const data = await response.json();
        const allMovies = data.movies;

        // Continue Watching: primeras 6 películas (con botón de play)
        if ($continueWatching && allMovies.length > 0) {
            const continueWatchingMovies = allMovies.slice(0, 6);
            $continueWatching.innerHTML = createCarouselHTML(continueWatchingMovies, true);
        }

        // New Releases: siguientes 6 películas (sin botón de play)
        if ($newReleases && allMovies.length > 6) {
            const newReleasesMovies = allMovies.slice(6, 12);
            $newReleases.innerHTML = createCarouselHTML(newReleasesMovies, false);
        }

    } catch (error) {
        console.error("Error al cargar carruseles:", error);
    }
}

function createCarouselHTML(movies, showPlayButton = false) {
    let html = '<div class="carousel-scroll">';

    movies.forEach((movie) => {
        const nombreArchivo = movie.photo_url ? movie.photo_url.split('/').pop() : "";
        const rutaImagenLocal = `MoviesImagenes/${nombreArchivo}`;

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFav = favorites.some(f => f.title === movie.title);
        const favIcon = isFav ? 'favorite' : 'favorite_border';
        const favClass = isFav ? 'text-red-500 fill-current' : 'text-slate-400';

        // Botón de play solo para Continue Watching
        const playButton = showPlayButton ? `
            <div class="carousel-play-overlay">
                <span class="material-symbols-outlined">play_arrow</span>
            </div>
        ` : '';

        html += `
            <div class="carousel-card">
                <a href="movies/movie_details.html?id=${movie.id}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                    <div class="carousel-thumb" style="background-image: url('${rutaImagenLocal}')">
                        ${playButton}
                    </div>
                    <div class="carousel-overlay">
                        <div class="carousel-content">
                            <div class="movie-title-row">
                                <h3 class="carousel-title">${movie.title}</h3>
                                <button class="fav-btn ${favClass}" data-title="${movie.title}">
                                    <span class="material-symbols-outlined">${favIcon}</span>
                                </button>
                            </div>
                            <div class="meta-row">
                                <span>${movie.release_year}</span>
                                <span class="rating-badge">HD</span>
                                <span>${movie.duration_min} min</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Ejecutar la carga inicial
LoadMovies();
LoadCarouselMovies();
