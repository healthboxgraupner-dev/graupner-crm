// ===================================
// Main App Controller
// ===================================

const app = {
    currentPage: 'dashboard',
    
    init() {
        this.setupNavigation();
        this.navigateTo('dashboard');
    },

    setupNavigation() {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;

        const userRole = authApp.currentUser?.role;
        const navItems = this.getNavigationItems(userRole);

        nav.innerHTML = navItems.map(item => `
            <div class="nav-item ${item.page === this.currentPage ? 'active' : ''}" 
                 onclick="app.navigateTo('${item.page}')">
                <i class="fas fa-${item.icon}"></i>
                <span>${item.label}</span>
            </div>
        `).join('');
    },

    getNavigationItems(role) {
        const baseItems = [
            { page: 'dashboard', icon: 'home', label: 'Dashboard' },
            { page: 'leads', icon: 'users', label: 'Leads' },
            { page: 'calculator', icon: 'calculator', label: 'Einkommensrechner' },
            { page: 'followup', icon: 'tasks', label: 'Follow-up' },
            { page: 'calendar', icon: 'calendar', label: 'Kalender' },
            { page: 'materials', icon: 'folder', label: 'Materialien' },
            { page: 'settings', icon: 'cog', label: 'Einstellungen' }
        ];

        if (role === 'teamleader' || role === 'admin') {
            baseItems.splice(6, 0,
                { page: 'activities', icon: 'chart-line', label: 'Aktivitäten' },
                { page: 'reports', icon: 'file-alt', label: 'Berichte' }
            );
        }

        if (role === 'admin') {
            baseItems.splice(8, 0,
                { page: 'users', icon: 'user-cog', label: 'Benutzerverwaltung' }
            );
        }

        return baseItems;
    },

    navigateTo(page) {
        this.currentPage = page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event?.currentTarget?.classList.add('active');

        // Update page title
        const pageTitles = {
            'dashboard': 'Dashboard',
            'leads': 'Lead-Management',
            'calculator': 'Einkommensrechner',
            'followup': 'Follow-up System',
            'calendar': 'Kalender',
            'activities': 'Aktivitäten',
            'users': 'Benutzerverwaltung',
            'materials': 'Materialien & Ressourcen',
            'reports': 'Berichte',
            'settings': 'Einstellungen'
        };
        
        document.getElementById('pageTitle').textContent = pageTitles[page] || page;

        // Render page content
        const content = document.getElementById('pageContent');
        if (content) {
            this.renderPage(page, content);
        }
    },

    renderPage(page, container) {
        const modules = {
            'dashboard': () => dashboardModule.render(container),
            'leads': () => leadsModule.render(container),
            'calculator': () => calculatorModule.render(container),
            'followup': () => followupModule.render(container),
            'calendar': () => calendarModule.render(container),
            'activities': () => activitiesModule.render(container),
            'users': () => usersModule.render(container),
            'materials': () => materialsModule.render(container),
            'reports': () => reportsModule.render(container),
            'settings': () => settingsModule.render(container)
        };

        const renderFunc = modules[page];
        if (renderFunc) {
            renderFunc();
        } else {
            container.innerHTML = `<div class="card"><p>Seite "${page}" wird geladen...</p></div>`;
        }
    }
};
