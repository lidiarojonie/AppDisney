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
        favButtons.forEach(btn => {
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

    // --- Filter Dropdown Logic ---
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && !filterBtn.contains(e.target)) {
                filterDropdown.classList.remove('active');
            }
        });

        // Close dropdown when an item is selected
        const dropdownItems = filterDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                filterDropdown.classList.remove('active');
            });
        });
    }
});

const API =
    "https://silver-chainsaw-7v4q6wwrw77vh4x7-3000.app.github.dev/api/movies";
const $contenedor = document.querySelector(".movies-grid");
const $searchInputHelper = document.querySelector(".search-input"); // Header search
const $pageSearchInput = document.querySelector(".all-movies-search-input"); // Page specific search

// Global state
let allMoviesData = [];

// --- FUNCIÓN PRINCIPAL DE CARGA ---
async function LoadMovies() {
    if (!$contenedor) return;

    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Error en la respuesta de la API");

        const data = await response.json();
        allMoviesData = data.movies;

        // Apply filters and render initially
        applyFiltersAndRender();

    } catch (error) {
        console.error("Error al cargar:", error);
        $contenedor.innerHTML = `<p class="error">Error al cargar la base de datos.</p>`;
    }
}

// --- FILTER & RENDER LOGIC ---
function applyFiltersAndRender() {
    if (!$contenedor) return;

    // Get search term from either input (prioritizing non-empty one or specialized one)
    // Actually, usually we might want them synchronized or just check both.
    const term1 = $searchInputHelper ? $searchInputHelper.value.toLowerCase().trim() : "";
    const term2 = $pageSearchInput ? $pageSearchInput.value.toLowerCase().trim() : "";
    // If user types in one, we use that. If both have values, logic depends on design.
    // Let's assume logical OR or just look for the active one.
    // Simpler approach: match both content-wise if they exist.
    const searchTerm = term1 || term2;

    // Sync values visually if you want, but for now just use the value.

    const path = window.location.pathname;
    const esHome = path.endsWith("index.html") || path === "/" || path === "" || path.includes("index");
    const esPaginaSeries = path.includes("series.html");
    const esPaginaPeliculas = path.includes("allMovies");

    const filtrados = allMoviesData.filter((item) => {
        // 1. Page Type Logic
        let pageMatch = true;
        if (esHome) pageMatch = true;
        else if (esPaginaSeries) pageMatch = item.is_series === 1;
        else if (esPaginaPeliculas) pageMatch = true;

        // 2. Search Logic
        const searchMatch = item.title.toLowerCase().includes(searchTerm);

        return pageMatch && searchMatch;
    });

    renderMovies(filtrados);
}

function renderMovies(movies) {
    let htmlTemplate = "";

    movies.forEach((peli) => {
        // Extract filename from database path and construct local path
        const nombreArchivo = peli.photo_url ? peli.photo_url.split('/').pop() : "";
        const rutaImagenLocal = `../MoviesImagenes/${nombreArchivo}`;

        // 2. Lógica de favoritos
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFav = favorites.some(f => f.title === peli.title);
        const favIcon = isFav ? 'favorite' : 'favorite_border';
        const favClass = isFav ? 'text-red-500 fill-current' : 'text-slate-400';

        htmlTemplate += `
            <div class="movie-card">
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
            </div>
        `;
    });

    $contenedor.innerHTML = htmlTemplate || '<p class="text-center w-full py-10 opacity-50">No movies found.</p>';
}

// --- EVENT LISTENERS ---
if ($searchInputHelper) {
    $searchInputHelper.addEventListener("input", () => {
        // Sync other input if needed, or just re-render
        applyFiltersAndRender();
    });
}
if ($pageSearchInput) {
    $pageSearchInput.addEventListener("input", () => {
        applyFiltersAndRender();
    });
}


// Ejecutar la carga
LoadMovies();

