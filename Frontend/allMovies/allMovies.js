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
    // Favorites functionality for All Movies page
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favButtons = document.querySelectorAll('.fav-btn');

    const getMovieData = (btn) => {
        const card = btn.closest('.movie-card');
        if (!card) return null;

        const title = btn.dataset.title;
        const posterImg = card.querySelector('.poster-image');
        const style = posterImg.getAttribute('style');
        const imageMatch = style.match(/url\("?(.+?)"?\)/);
        const image = imageMatch ? imageMatch[1] : '';

        const rating = card.querySelector('.rating-badge')?.textContent.trim() || '';
        const metaSpans = card.querySelectorAll('.meta-row span');
        const duration = metaSpans.length > 0 ? metaSpans[metaSpans.length - 1].textContent.trim() : '';
        const type = duration.includes('Season') ? 'series' : 'movie';

        return { title, image, rating, duration, type };
    };

    const toggleFavorite = (btn) => {
        const title = btn.dataset.title;
        const index = favorites.findIndex(f => f.title === title);

        if (index !== -1) {
            favorites.splice(index, 1);
            updateButtonState(btn, false);
        } else {
            const movieData = getMovieData(btn);
            if (movieData) {
                favorites.push(movieData);
                updateButtonState(btn, true);
            }
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        syncAllButtons(title, index === -1);
    };

    const updateButtonState = (btn, isFavorite) => {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (isFavorite) {
            icon.textContent = 'favorite';
            icon.classList.add('text-red-500', 'fill-current');
            btn.classList.add('text-red-500');
        } else {
            icon.textContent = 'favorite_border';
            icon.classList.remove('text-red-500', 'fill-current');
            btn.classList.remove('text-red-500');
        }
    };

    const syncAllButtons = (title, isFavorite) => {
        favButtons.forEach(btn => {
            if (btn.dataset.title === title) {
                updateButtonState(btn, isFavorite);
            }
        });
    };

    favButtons.forEach(btn => {
        const title = btn.dataset.title;
        const isFav = favorites.some(f => f.title === title);
        if (isFav) updateButtonState(btn, true);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(btn);
        });
    });
});
