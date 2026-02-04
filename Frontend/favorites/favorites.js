document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.poster-grid');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Filters logic
    const filterButtons = document.querySelectorAll('.cat-pill');
    let currentFilter = 'All Items';

    const renderFavorites = (items) => {
        grid.innerHTML = '';

        if (items.length === 0) {
            grid.innerHTML = '<p class="text-low" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No favorites added yet.</p>';
            return;
        }

        items.forEach(movie => {
            // Check if legacy string format, skip or handle
            if (typeof movie === 'string') return;

            const card = document.createElement('div');
            card.className = 'poster-card';

            // Handle potentially missing properties
            const imageSrc = movie.image || '';
            const rating = movie.rating || '';
            const duration = movie.duration || '';

            card.innerHTML = `
                <div class="poster-image-container">
                    <img class="poster-img" src="${imageSrc}" alt="${movie.title} poster" />
                    <div class="favorite-btn" data-title="${movie.title}">
                        <span class="material-symbols-outlined text-lg-icon"
                            style="font-variation-settings: 'FILL' 1">favorite</span>
                    </div>
                    <div class="hover-overlay">
                        <button class="play-btn">
                            <span class="material-symbols-outlined">play_arrow</span> Play
                        </button>
                        <div class="meta-info">
                            <span class="rating-badge">${rating}</span>
                            <span>${duration}</span>
                        </div>
                    </div>
                </div>
                <p class="poster-title">${movie.title}</p>
            `;

            // Add remove functionality
            const favBtn = card.querySelector('.favorite-btn');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(movie.title);
            });

            grid.appendChild(card);
        });
    };

    const removeFavorite = (title) => {
        const updatedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = updatedFavorites.findIndex(f => (typeof f === 'string' ? f === title : f.title === title));

        if (index !== -1) {
            updatedFavorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

            // Re-render based on current filter
            // Ideally we'd just remove the element for performance, but re-rendering is safer for sync
            applyFilter();
        }
    };

    const applyFilter = () => {
        const allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        // Filter out any legacy strings if necessary or convert them
        const validFavs = allFavs.filter(f => typeof f === 'object');

        let filtered = validFavs;
        if (currentFilter === 'Movies') {
            filtered = validFavs.filter(f => f.type === 'movie');
        } else if (currentFilter === 'Series') {
            filtered = validFavs.filter(f => f.type === 'series');
        }
        // "Disney+ Originals" - we don't store "original" data yet, so ignoring or using heuristic if available
        // For now, treats as All or TODO

        renderFavorites(filtered);
    };

    // Filter Buttons Event Listeners
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI
            filterButtons.forEach(b => b.classList.replace('active', 'inactive'));
            btn.classList.replace('inactive', 'active');

            // Update filter
            currentFilter = btn.querySelector('p').textContent;
            applyFilter();
        });
    });

    // Initial Render
    applyFilter();
});
