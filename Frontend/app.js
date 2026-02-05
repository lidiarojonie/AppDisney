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
    const toggleFavorite = (btn) => {
        const title = btn.dataset.title;
        const index = favorites.findIndex(f => f.title === title);

        if (index !== -1) {
            // Remove from favorites
            favorites.splice(index, 1);
            updateButtonState(btn, false);
        } else {
            // Add to favorites
            // Try to get full object data
            const movieData = getMovieData(btn);
            if (movieData) {
                favorites.push(movieData);
                updateButtonState(btn, true);
            } else {
                // Fallback for pages where we might not have full card data (unlikely in index)
                // But if we are in favorites page, we might handle un-favoriting differently
                console.warn('Could not extract movie data');
            }
        }

        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Sync other buttons for the same movie
        syncAllButtons(title, index === -1); // index === -1 means we just added it
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
});

const API =
    "https://legendary-telegram-pjqv499g9jj5279wv-3000.app.github.dev/api/movies";
const $contenedor = document.querySelector(".movies-grid");

async function LoadMovies() {
    try {
        const response = await fetch(API);
        const data = await response.json();
        const allItems = data.movies;

        const path = window.location.pathname;

        const esHome = path.endsWith("index.html") || path === "/" || path === "";
        const esPaginaSeries = path.includes("series.html");
        const esPaginaPeliculas = path.includes("peliculas.html");

        const filtrados = allItems.filter((item) => {
            if (esHome) {
                return true;
            } else if (esPaginaSeries) {
                return item.is_series === 0;
            } else if (esPaginaPeliculas) {
                return item.is_series === 1;
            }
            return true;
        });

        let htmlTemplate = "";

        filtrados.forEach((peli) => {
          htmlTemplate += `
            <div class="tarjeta-pelicula">
                <div class="portada-pelicula">
                    <img src="${peli.url_portada}" alt="${peli.titulo}" loading="lazy" />
                </div>
                <div class="info-tarjeta">
                    <span>${peli.titulo}</span>
                </div>
            </div>
          `;
        });
    
        $contenedor.innerHTML = htmlTemplate;
      } catch (error) {
        console.error("Error al cargar:", error);
        $contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
      }
    }
    
    LoadMovies();