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
        
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        console.log('Login-Versuch:', { email, password: '***' });
        
        const user = this.authenticateUser(email, password);
        
        console.log('Gefundener User:', user ? user.name : 'Keiner');
        
        if (user) {
            this.loginSuccess(user);
        } else {
            this.loginFailed(email);
        }
    },

    authenticateUser(email, password) {
        const users = DB.get('users');
        
        console.log('Alle Benutzer in DB:', users.length);
        console.log('Suche nach:', email);
        
        // E-Mail case-insensitive vergleichen
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!user) {
            // Debug: Prüfe ob E-Mail existiert
            const emailExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                console.log('✋ E-Mail existiert, aber Passwort falsch!');
                console.log('User-Status:', emailExists.status);
                console.log('Gespeichertes Passwort:', emailExists.password);
                console.log('Eingegebenes Passwort:', password);
                console.log('Passwörter identisch?', emailExists.password === password);
            } else {
                console.log('❌ E-Mail existiert NICHT in Datenbank');
                console.log('Verfügbare E-Mails:', users.map(u => u.email));
            }
        } else {
            console.log('✅ Login erfolgreich für:', user.name);
        }

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

    loginFailed(email) {
        console.error('Login fehlgeschlagen für:', email);
        alert('❌ Login fehlgeschlagen!\n\nBitte überprüfen Sie Ihre Zugangsdaten.\n\nBei Problemen wenden Sie sich an Ihren Administrator.\n\n💡 Tipp: Öffnen Sie die Browser-Konsole (F12) für Details.');
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
    },

    // DEBUG: Admin-Reset-Funktion (in Browser-Konsole aufrufen: authApp.resetAdminPassword())
    resetAdminPassword() {
        const users = DB.get('users');
        const admin = users.find(u => u.email === 'admin@healthbox.ae');
        
        if (admin) {
            admin.password = 'HealthBox2025!Admin';
            admin.status = 'active';
            DB.update('users', admin.id, admin);
            console.log('✅ Admin-Passwort zurückgesetzt auf: HealthBox2025!Admin');
            alert('✅ Admin-Passwort wurde zurückgesetzt!\n\nE-Mail: admin@healthbox.ae\nPasswort: HealthBox2025!Admin\n\nBitte Seite neu laden (F5)');
        } else {
            console.error('❌ Admin-Account nicht gefunden!');
            console.log('Verfügbare Benutzer:', users);
        }
    }
};
