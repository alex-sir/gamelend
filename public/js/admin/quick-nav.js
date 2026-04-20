document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar input[name="query"]');
    const searchForm = document.querySelector('.search-bar form');
    const searchBarContainer = document.querySelector('.search-bar');

    if (!searchInput || !searchForm || !searchBarContainer) return;

    // Define searchable admin pages
    const adminPages = [
        { name: 'Dashboard', url: '/admin/dashboard', icon: 'bi-speedometer2', keywords: ['home', 'main', 'index'] },
        { name: 'Analytics', url: '/admin/analytics', icon: 'bi-graph-up-arrow', keywords: ['stats', 'data', 'charts', 'revenue'] },
        { name: 'Moderation Hub', url: '/admin/moderation', icon: 'bi-shield-check', keywords: ['reports', 'flags', 'mod'] },
        { name: 'Manage Users', url: '/admin/users', icon: 'bi-people', keywords: ['accounts', 'borrowers', 'lenders', 'profiles'] },
        { name: 'Manage Listings', url: '/admin/listings', icon: 'bi-controller', keywords: ['games', 'items', 'inventory', 'consoles'] },
        { name: 'Manage Categories', url: '/admin/categories', icon: 'bi-tags', keywords: ['types', 'genres', 'labels'] },
        { name: 'Platform Settings', url: '/admin/settings', icon: 'bi-gear', keywords: ['config', 'fees', 'maintenance', 'system'] }
    ];

    // Create custom dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'quick-nav-dropdown';
    searchBarContainer.style.position = 'relative';
    searchBarContainer.appendChild(dropdown);

    function updateDropdown(filter = '') {
        if (filter === '') {
            dropdown.classList.remove('show');
            return;
        }

        const filtered = adminPages.filter(p => 
            p.name.toLowerCase().includes(filter.toLowerCase()) || 
            p.keywords.some(k => k.includes(filter.toLowerCase()))
        );
        
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div class="quick-nav-category text-muted">No matching pages</div>';
            dropdown.classList.add('show');
            return;
        }

        dropdown.innerHTML = '<div class="quick-nav-category">Navigate To Page</div>';
        filtered.forEach((page, index) => {
            const item = document.createElement('a');
            item.href = page.url;
            item.className = 'quick-nav-item' + (index === 0 ? ' active' : '');
            item.innerHTML = `<i class="bi ${page.icon}"></i><span>${page.name}</span>`;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = page.url;
            });
            dropdown.appendChild(item);
        });
        dropdown.classList.add('show');
    }

    searchInput.addEventListener('input', (e) => {
        updateDropdown(e.target.value);
    });

    searchInput.addEventListener('focus', (e) => {
        updateDropdown(e.target.value);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBarContainer.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Disable traditional form submission entirely
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the redirect to /admin/search
        
        const query = searchInput.value.trim().toLowerCase();
        const matchedPage = adminPages.find(p => 
            p.name.toLowerCase() === query || 
            p.keywords.some(k => k === query)
        );

        if (matchedPage) {
            window.location.href = matchedPage.url;
        } else {
            // If no match on enter, try to go to the first item in the dropdown
            const firstItem = dropdown.querySelector('.quick-nav-item');
            if (firstItem) {
                window.location.href = firstItem.href;
            }
        }
    });

    // Keyboard navigation (Esc to close)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.remove('show');
            searchInput.blur();
        }
    });
});
