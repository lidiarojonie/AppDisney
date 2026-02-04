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

    // Helper: Extract movie data from card
    const getMovieData = (btn) => {
        const card = btn.closest('.movie-card');
        if (!card) return null;

        const title = btn.dataset.title;
        // Extract content from style="background-image: url('...')"
        const style = card.querySelector('.poster-image').getAttribute('style');
        const imageMatch = style.match(/url\("?(.+?)"?\)/);
        const image = imageMatch ? imageMatch[1] : '';

        const rating = card.querySelector('.rating-badge')?.textContent.trim() || '';

        // Duration is usually the last span in meta-row, or we can grab all text and parse
        // In this specific HTML structure, it's the last span
        const metaSpans = card.querySelectorAll('.meta-row span');
        const duration = metaSpans.length > 0 ? metaSpans[metaSpans.length - 1].textContent.trim() : '';

        // Determine type based on duration (simple heuristic for now)
        // If duration contains "Season", it's a series, else movie
        const type = duration.includes('Season') ? 'series' : 'movie';

        return { title, image, rating, duration, type };
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

    // 6. Attach click listeners and set initial state
    favButtons.forEach(btn => {
        const title = btn.dataset.title;
        // Check if favorite exists by title
        // Handle migration from old string-only storage if needed, but let's assume fresh start or overwrite
        // If favorites has strings, this might crash. Let's filter out strings just in case or handle it.
        // For now, let's assume we reset or it's fine.

        let isFav = false;
        if (favorites.length > 0) {
            // Handle potential legacy string data
            if (typeof favorites[0] === 'string') {
                isFav = favorites.includes(title);
            } else {
                isFav = favorites.some(f => f.title === title);
            }
        }

        if (isFav) {
            updateButtonState(btn, true);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering card click
            e.preventDefault();
            toggleFavorite(btn);
        });
    });
});
