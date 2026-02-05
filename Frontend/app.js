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

async function LoadMovies() {
    try {
        // const response = await fetch(API);
        // const data = await response.json();
        // const allItems = data.movies;

        const allItems = [
            { titulo: "The Mandalorian", url_portada: "MoviesImagenes/TheMandalorian.jpg", is_series: 1, duration: "45m", categories: ["Sci-Fi", "Action", "Adventure"] },
            { titulo: "Avatar", url_portada: "MoviesImagenes/Avatar.jpg", is_series: 0, duration: "2h 42m", categories: ["Sci-Fi", "Action", "Adventure"] },
            { titulo: "Avengers", url_portada: "MoviesImagenes/Avengers.jpeg", is_series: 0, duration: "2h 23m", categories: ["Action", "Sci-Fi", "Superhero"] },
            { titulo: "Star Wars", url_portada: "MoviesImagenes/StarWars.jpg", is_series: 0, duration: "2h 01m", categories: ["Sci-Fi", "Action", "Fantasy"] },
            { titulo: "Black Panther", url_portada: "MoviesImagenes/BlackPanther.jpeg", is_series: 0, duration: "2h 14m", categories: ["Action", "Superhero", "Adventure"] },
            { titulo: "Black Widow", url_portada: "MoviesImagenes/BlackWidow.jpeg", is_series: 0, duration: "2h 14m", categories: ["Action", "Thriller", "Superhero"] },
            { titulo: "Coco", url_portada: "MoviesImagenes/Coco.jpeg", is_series: 0, duration: "1h 45m", categories: ["Animation", "Family", "Music"] },
            { titulo: "Encanto", url_portada: "MoviesImagenes/Encanto.jpg", is_series: 0, duration: "1h 42m", categories: ["Animation", "Family", "Musical"] },
            { titulo: "Frozen", url_portada: "MoviesImagenes/Frozen.jpg", is_series: 0, duration: "1h 42m", categories: ["Animation", "Family", "Adventure"] },
            { titulo: "Moana", url_portada: "MoviesImagenes/Moana.jpeg", is_series: 0, duration: "1h 47m", categories: ["Animation", "Family", "Adventure"] },
            { titulo: "Aladdin", url_portada: "MoviesImagenes/Aladdin.jpeg", is_series: 0, duration: "2h 08m", categories: ["Adventure", "Family", "Romance"] },
            { titulo: "Jungle Cruise", url_portada: "MoviesImagenes/JungleCruise.jpeg", is_series: 0, duration: "2h 07m", categories: ["Adventure", "Comedy", "Action"] },
            { titulo: "Maleficent", url_portada: "MoviesImagenes/Maleficent.png", is_series: 0, duration: "1h 37m", categories: ["Fantasy", "Family", "Adventure"] },
            { titulo: "Pirates of the Caribbean", url_portada: "MoviesImagenes/PiratesCaribbean.jpg", is_series: 0, duration: "2h 23m", categories: ["Action", "Adventure", "Fantasy"] },
            { titulo: "Ratatouille", url_portada: "MoviesImagenes/Ratatouille.jpeg", is_series: 0, duration: "1h 51m", categories: ["Animation", "Comedy", "Family"] },
            { titulo: "The Lion King", url_portada: "MoviesImagenes/TheLionKing.jpg", is_series: 0, duration: "1h 58m", categories: ["Animation", "Drama", "Adventure"] },
            { titulo: "Toy Story", url_portada: "MoviesImagenes/ToyStory.jpg", is_series: 0, duration: "1h 21m", categories: ["Animation", "Adventure", "Comedy"] },
            { titulo: "Tron", url_portada: "MoviesImagenes/Tron.jpg", is_series: 0, duration: "2h 05m", categories: ["Sci-Fi", "Action", "Adventure"] },
            { titulo: "Up", url_portada: "MoviesImagenes/Up.jpg", is_series: 0, duration: "1h 36m", categories: ["Animation", "Adventure", "Comedy"] },
            { titulo: "Wall-E", url_portada: "MoviesImagenes/WallE.jpeg", is_series: 0, duration: "1h 38m", categories: ["Animation", "Sci-Fi", "Family"] }
        ];

        const path = window.location.pathname;
        const esHome = path.endsWith("home.html") || path === "/" || path === "";

        // Helper to create card HTML
        const createCard = (peli, withPlayButton = false) => {
            const categoriesHtml = peli.categories
                .map((cat, index, arr) => `<span>${cat}</span>${index < arr.length - 1 ? '<span>•</span>' : ''}`)
                .join('');

            return `
                <div class="movie-card">
                    <div class="poster-image">
                        <img src="${peli.url_portada}" alt="${peli.titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">
                        ${withPlayButton ? `
                        <div class="play-overlay">
                            <span class="material-symbols-outlined">play_arrow</span>
                        </div>` : ''}
                    </div>
                    <div class="movie-info-static">
                        <span>${peli.titulo}</span>
                    </div>
                    <div class="movie-popover">
                        <div class="popover-thumb" style="background-image: url('${peli.url_portada}')"></div>
                        <div class="popover-content">
                            <div class="movie-title-row">
                                <h4 class="movie-title">${peli.titulo}</h4>
                                <button class="fav-btn" data-title="${peli.titulo}" 
                                        data-photo_url="${peli.url_portada}" 
                                        data-release_year="2024" 
                                        data-duration_min="${peli.duration}" 
                                        data-summary="Movie summary..." 
                                        data-is_series="${peli.is_series}">
                                    <span class="material-symbols-outlined">favorite_border</span>
                                </button>
                            </div>
                            <div class="meta-row">
                                <span class="match-score">98% Match</span>
                                <span class="rating-badge">${peli.is_series ? 'TV-14' : 'PG-13'}</span>
                                <span>${peli.duration}</span>
                                <span>HD</span>
                            </div>
                            <div class="meta-row">
                                ${categoriesHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        if (esHome) {
            // Populate Carousels
            // 1. Continue Watching (First 5 items)
            if ($continueWatching) {
                $continueWatching.innerHTML = allItems.slice(0, 5).map(item => createCard(item, true)).join('');
            }

            // 2. New Releases (Next 5 items)
            if ($newReleases) {
                $newReleases.innerHTML = allItems.slice(5, 10).map(item => createCard(item)).join('');
            }

            // 3. Catalogue (All items)
            if ($contenedor) {
                $contenedor.innerHTML = allItems.map(item => createCard(item)).join('');
            }
        } else {
            // Logic for other pages (All Movies, etc.)
            const filtrados = allItems.filter((item) => {
                const esPaginaSeries = path.includes("series.html");
                const esPaginaPeliculas = path.includes("peliculas.html"); // Assuming this logic was correct for other pages or just generic listing
                // Note: Original code had specific filtering logic, preserving basic list render for other pages
                return true;
            });
            if ($contenedor) {
                $contenedor.innerHTML = filtrados.map(item => createCard(item)).join('');
            }
        }

        // Re-initialize favorite buttons after DOM update
        const initButtons = () => {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const btns = document.querySelectorAll('.fav-btn');
            btns.forEach(btn => {
                const title = btn.dataset.title;
                const isFav = favorites.some(f => f.title === title);
                const icon = btn.querySelector('.material-symbols-outlined');
                if (isFav) {
                    icon.textContent = 'favorite';
                    icon.classList.add('text-red-500', 'fill-current');
                    btn.classList.add('text-red-500');
                }
            });
        };
        initButtons();

    } catch (error) {
        console.error("Error al cargar:", error);
        if ($contenedor) $contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

LoadMovies();
