document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        // Redirect or show error if no ID
        console.error("No movie ID provided");
        document.querySelector('.movie-title').textContent = "Movie not found";
        return;
    }

    const API = "https://silver-chainsaw-7v4q6wwrw77vh4x7-3000.app.github.dev/api/movies";

    try {
        // 2. Fetch all movies (Client-side filtering as per plan)
        const response = await fetch(API);
        if (!response.ok) throw new Error("API Connection Error");

        const data = await response.json();
        const movies = data.movies;

        // 3. Find the specific movie
        // Comparing as string/number safely
        const movie = movies.find(m => m.id == movieId);

        if (movie) {
            renderMovieDetails(movie);
        } else {
            document.querySelector('.movie-title').textContent = "Movie not found";
        }

    } catch (error) {
        console.error("Error loading movie details:", error);
    }

    function renderMovieDetails(movie) {
        // Update Title
        document.title = `${movie.title} | Disney+`;
        document.getElementById('movieTitle').textContent = movie.title.toUpperCase();
        document.getElementById('breadcrumbTitle').textContent = movie.title;

        // Update Meta Info
        document.getElementById('movieYear').textContent = movie.release_year;
        document.getElementById('movieDuration').textContent = `${movie.duration_min}m`;

        // Genre (Map genre_id to text if possible, or leave static/generic for now if unknown)
        // Simple mapping based on known IDs from previous tasks
        const genres = {
            1: "Animation, Family", // Disney
            2: "Animation, Comedy", // Pixar
            3: "Action, Sci-Fi",    // Marvel
            4: "Sci-Fi, Adventure", // Star Wars
            5: "Documentary"        // Stream+ / Nat Geo
        };
        document.getElementById('movieGenre').textContent = genres[movie.genre_id] || "Movie";

        // Description
        // If summary exists, use it. Otherwise placeholder.
        // Assuming API might not have 'summary' on all items or it might be named differently?
        // Checking allMovies.js getMovieData, it grabs dataset.summary.
        // Let's assume the API object has 'summary' or 'description'.
        // If not, we'll put a placeholder.
        const summary = movie.summary || movie.description || `Experience the magic of ${movie.title}.`;
        document.getElementById('movieDescription').textContent = summary;

        // Background Image
        // Construct path: ../MoviesImagenes/filename
        const fileName = movie.photo_url ? movie.photo_url.split('/').pop() : "";
        const imagePath = `../MoviesImagenes/${fileName}`;

        const heroImg = document.getElementById('heroImage');
        heroImg.src = imagePath;
        heroImg.onload = () => heroImg.classList.add('loaded');

        // Trailer
        const trailerBtn = document.getElementById('trailerBtn');
        if (movie.trailer_url) {
            trailerBtn.href = movie.trailer_url;
            trailerBtn.style.display = 'inline-flex';
        } else {
            trailerBtn.style.display = 'none'; // Hide if no trailer
        }

        // Favorites Logic Integration
        setupFavoriteButton(movie);
    }

    function setupFavoriteButton(movie) {
        const favBtn = document.getElementById('detailsFavBtn');
        if (!favBtn) return;

        // LocalStorage connection
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFav = favorites.some(f => f.title === movie.title);

        updateFavIcon(favBtn, isFav);

        favBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Re-read storage
            let currentFavs = JSON.parse(localStorage.getItem('favorites')) || [];
            const index = currentFavs.findIndex(f => f.title === movie.title);

            if (index !== -1) {
                // Remove
                currentFavs.splice(index, 1);
                updateFavIcon(favBtn, false);
            } else {
                // Add
                // Ensure we save structure compatible with other pages
                const fileName = movie.photo_url ? movie.photo_url.split('/').pop() : "";
                const cleanMovie = {
                    ...movie,
                    photo_url: `MoviesImagenes/${fileName}` // Standardizing info
                };
                currentFavs.push(cleanMovie);
                updateFavIcon(favBtn, true);
            }

            localStorage.setItem('favorites', JSON.stringify(currentFavs));
        });
    }

    function updateFavIcon(btn, isFav) {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (isFav) {
            icon.textContent = 'favorite';
            icon.classList.add('text-red-500', 'fill-current');
            // Assuming we might need to add specific styling class if specific to this page
            // styles.css handles .text-red-500 usually
        } else {
            icon.textContent = 'favorite_border';
            icon.classList.remove('text-red-500', 'fill-current');
        }
    }
});
