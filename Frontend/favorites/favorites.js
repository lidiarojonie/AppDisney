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
            let photoUrl = movie.photo_url || '';
            if (photoUrl.startsWith("Frontend/")) {
                photoUrl = photoUrl.replace("Frontend/", "");
            }
            // Since favorites.html is in favorites/, we need to go up one level
            photoUrl = "../" + photoUrl;

            const duration = movie.duration_min ? movie.duration_min + 'm' : '';

            card.innerHTML = `
                <div class="poster-image-container">
                    <img class="poster-img" src="${photoUrl}" alt="${movie.title} poster" />
                    <div class="favorite-btn" data-title="${movie.title}">
                        <span class="material-symbols-outlined text-lg-icon"
                            style="font-variation-settings: 'FILL' 1">favorite</span>
                    </div>
                    <div class="hover-overlay">
                        <button class="play-btn">
                            <span class="material-symbols-outlined">play_arrow</span> Play
                        </button>
                        <div class="meta-info">
                            <span class="rating-badge">98% Match</span>
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
            filtered = validFavs.filter(f => f.is_series === 1);
        } else if (currentFilter === 'Series') {
            filtered = validFavs.filter(f => f.is_series === 0);
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
            currentFilter = btn.textContent.trim();
            applyFilter();
        });
    });

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

    // Initial render
    applyFilter();
});
