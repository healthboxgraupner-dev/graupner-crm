// ===================================
// Authentication Module
// ===================================

const authApp = {
    currentUser: null,

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }

        // Setup login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
    },

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    },

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';

        // Update sidebar with user info
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        if (userNameEl) userNameEl.textContent = this.currentUser.name;
        if (userRoleEl) {
            const roles = {
                'admin': 'Administrator',
                'teamleader': 'Teamleader',
                'partner': 'Partner'
            };
            userRoleEl.textContent = roles[this.currentUser.role] || this.currentUser.role;
        }

        // Initialize main app
        if (typeof app !== 'undefined') {
            app.init();
        }

        // Log activity
        this.logActivity('login', `${this.currentUser.name} hat sich angemeldet`);
    },

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const user = this.authenticateUser(email, password);
        
        if (user) {
            this.loginSuccess(user);
        } else {
            this.loginFailed();
        }
    },

    authenticateUser(email, password) {
        const users = DB.get('users');

        // Check for exact match only
        const user = users.find(u => u.email === email && u.password === password);

        return user && user.status === 'active' ? user : null;
    },

    loginSuccess(user) {
        this.currentUser = user;
        localStorage.setItem('current_user', JSON.stringify(user));
        this.showMainApp();
        
        // Show success message
        if (typeof showToast !== 'undefined') {
            showToast('success', `Willkommen zurück, ${user.name}!`);
        }
    },

    loginFailed() {
        alert('❌ Login fehlgeschlagen!\n\nBitte überprüfen Sie Ihre Zugangsdaten.\n\nBei Problemen wenden Sie sich an Ihren Administrator.');
    },

    logout() {
        if (confirm('Möchten Sie sich wirklich abmelden?')) {
            this.logActivity('logout', `${this.currentUser.name} hat sich abgemeldet`);
            this.currentUser = null;
            localStorage.removeItem('current_user');
            this.showLoginScreen();
            
            if (typeof showToast !== 'undefined') {
                showToast('info', 'Sie wurden erfolgreich abgemeldet');
            }
        }
    },

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    hasPermission(requiredRole) {
        if (!this.currentUser) return false;
        
        const hierarchy = {
            'admin': 3,
            'teamleader': 2,
            'partner': 1
        };
        
        const userLevel = hierarchy[this.currentUser.role] || 0;
        const requiredLevel = hierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    },

    canAccessLead(leadId) {
        if (this.currentUser.role === 'admin') return true;
        
        const lead = DB.findById('leads', leadId);
        if (!lead) return false;
        
        if (this.currentUser.role === 'teamleader') {
            // Teamleader can access their team's leads
            const assignedUser = DB.findById('users', lead.assignedTo);
            return assignedUser && assignedUser.teamleader === this.currentUser.id;
        }
        
        // Partners can only access their own leads
        return lead.assignedTo === this.currentUser.id;
    },

    logActivity(type, description) {
        const activity = {
            id: 'act_' + Date.now(),
            type: type,
            user: this.currentUser ? this.currentUser.name : 'System',
            userId: this.currentUser ? this.currentUser.id : 'system',
            description: description,
            timestamp: Date.now()
        };
        
        DB.add('activities', activity);
    }
};
