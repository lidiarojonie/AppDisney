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
    "https://legendary-telegram-pjqv499g9jj5279wv-3000.app.github.dev/api/movies";
const $contenedor = document.querySelector(".movies-grid");
const $continueWatching = document.getElementById("continue-watching-container");
const $newReleases = document.getElementById("new-releases-container");

// --- FUNCIÓN PRINCIPAL ---
async function LoadMovies() {
    if (!$contenedor) return;

    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Error en la respuesta de la API");

        const data = await response.json();
        // IMPORTANTE: Asegúrate de que tu API devuelve los datos en data.movies
        const allItems = data.movies;

        const path = window.location.pathname;
        const esHome = path.endsWith("index.html") || path === "/" || path === "" || path.includes("index");
        const esPaginaSeries = path.includes("series.html");
        const esPaginaPeliculas = path.includes("allMovies");

        const filtrados = allItems.filter((item) => {
            if (esHome) return true;
            // En tu BD: is_series (1 para sí, 0 para no)
            if (esPaginaSeries) return item.is_series === 1;
            if (esPaginaPeliculas) return true; // Show all items, same as home
            return true;
        });

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        let htmlTemplate = "";

        filtrados.forEach((peli) => {
            // 1. Limpieza de imagen: extraemos solo "Encanto.jpg" de la ruta de la BD
            const nombreArchivo = peli.photo_url ? peli.photo_url.split('/').pop() : "";
            const rutaImagenLocal = `MoviesImagenes/${nombreArchivo}`;

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

        $contenedor.innerHTML = htmlTemplate;

    } catch (error) {
        console.error("Error al cargar:", error);
        $contenedor.innerHTML = `<p class="error">Error al cargar la base de datos.</p>`;
    }
}

// Ejecutar la carga
LoadMovies();
