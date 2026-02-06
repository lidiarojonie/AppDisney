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
    // const filterButtons = document.querySelectorAll('.cat-pill'); // Removed
    // let currentFilter = 'All Items'; // Removed
    let currentGenreId = null;
    let currentSortOrder = 'title_asc';

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
                <a href="../movies/movie_details.html?id=${movie.id}" style="text-decoration: none; color: inherit; display: block;">
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
                </a>
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



    // Filter Buttons Event Listeners
    // Filter Buttons Event Listeners - Removed
    // filterButtons.forEach(btn => { ... });

    // --- Filter Dropdown Logic ---
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    const $searchInputHelper = document.querySelector(".search-input"); // Header search
    const $pageSearchInput = document.querySelector(".favorites-search-input"); // Page specific search

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
            item.addEventListener('click', (e) => {
                filterDropdown.classList.remove('active');
                currentGenreId = e.target.dataset.genreId || null; // Handle "All" which is empty string

                // Update button text logic if desired (optional)
                // const btnText = filterBtn.childNodes[2]; 
                // if(btnText) btnText.textContent = e.target.textContent;

                applyFilter();
            });
        });
    }

    // --- Search & Filter Logic ---
    const applyFilter = () => {
        const allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        // Filter out any legacy strings if necessary or convert them
        const validFavs = allFavs.filter(f => typeof f === 'object');

        // Search Term
        const term1 = $searchInputHelper ? $searchInputHelper.value.toLowerCase().trim() : "";
        // Removed page specific search input
        // const term2 = $pageSearchInput ? $pageSearchInput.value.toLowerCase().trim() : "";
        const searchTerm = term1;

        let filtered = validFavs;

        // 1. Apply Search
        if (searchTerm) {
            filtered = filtered.filter(f => f.title.toLowerCase().includes(searchTerm));
        }

        // 2. Apply Category Filter (Pills) - Removed
        // if (currentFilter === 'Movies') { ... }

        // 3. Apply Genre Filter
        // 3. Apply Genre Filter
        if (currentGenreId) {
            // parseInt because dataset is string, genre_id is number
            filtered = filtered.filter(f => f.genre_id === parseInt(currentGenreId));
        }

        // 4. Sorting Logic
        filtered.sort((a, b) => {
            if (currentSortOrder === 'title_asc') {
                return a.title.localeCompare(b.title);
            } else if (currentSortOrder === 'title_desc') {
                return b.title.localeCompare(a.title);
            } else if (currentSortOrder === 'year_desc') {
                return b.release_year - a.release_year;
            } else if (currentSortOrder === 'year_asc') {
                return a.release_year - b.release_year;
            }
            return 0;
        });

        renderFavorites(filtered);
    };

    // Event Listeners for Search
    if ($searchInputHelper) {
        $searchInputHelper.addEventListener("input", applyFilter);
    }

    // --- ORDER DROPDOWN LOGIC ---
    const orderBtn = document.getElementById('orderBtn');
    const orderDropdown = document.getElementById('orderDropdown');

    if (orderBtn && orderDropdown) {
        orderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            orderDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!orderDropdown.contains(e.target) && !orderBtn.contains(e.target)) {
                orderDropdown.classList.remove('active');
            }
        });

        const orderItems = orderDropdown.querySelectorAll('.dropdown-item');
        orderItems.forEach(item => {
            item.addEventListener('click', (e) => {
                currentSortOrder = e.target.dataset.sort;
                orderDropdown.classList.remove('active');
                applyFilter();
            });
        });
    }

    // Initial render
    applyFilter();
});
