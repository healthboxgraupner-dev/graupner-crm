// ===================================
// Database Management (LocalStorage)
// ===================================

const db = {
    // Initialize database with demo data
    init() {
        // Check if users exist, if not, initialize
        const users = this.getUsers();
        if (!users || users.length === 0) {
            console.log('No users found, initializing database...');
            this.initDemoData();
            localStorage.setItem('healthbox_initialized', 'true');
        } else if (!localStorage.getItem('healthbox_initialized')) {
            // Backward compatibility: Set flag if users exist but flag is missing
            localStorage.setItem('healthbox_initialized', 'true');
        }
    },

    // Initialize demo data
    initDemoData() {
        // PRODUCTION: Only create initial admin account
        // WICHTIG: Ändern Sie das Passwort nach dem ersten Login!
        const users = [
            {
                id: 'admin_001',
                name: 'HEALTHBOX Administrator',
                email: 'admin@healthbox.ae',
                password: 'HealthBox2025!Admin',
                role: 'admin',
                status: 'active',
                phone: '',
                teamLeaderId: null,
                createdAt: Date.now()
            }
        ];
        this.setUsers(users);

        // Initialize empty data arrays - no demo data for production
        this.setLeads([]);
        this.setCalls([]);
        this.setFollowups([]);
        this.setReflections([]);
        this.setMonthlyData([]);
        this.setNotifications([]);
        this.setPendingRegistrations([]);
    },

    // Generic storage methods
    get(key) {
        const data = localStorage.getItem(`healthbox_${key}`);
        return data ? JSON.parse(data) : null;
    },

    set(key, value) {
        localStorage.setItem(`healthbox_${key}`, JSON.stringify(value));
    },

    // Users
    getUsers() {
        return this.get('users') || [];
    },

    setUsers(users) {
        this.set('users', users);
    },

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    },

    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        this.setUsers(users);
    },

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.setUsers(users);
        }
    },

    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        this.setUsers(filtered);
    },

    // Leads
    getLeads(userId = null) {
        const leads = this.get('leads') || [];
        if (userId) {
            return leads.filter(l => l.userId === userId);
        }
        return leads;
    },

    setLeads(leads) {
        this.set('leads', leads);
    },

    addLead(lead) {
        const leads = this.getLeads();
        leads.push(lead);
        this.setLeads(leads);
    },

    updateLead(id, updates) {
        const leads = this.getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updates };
            this.setLeads(leads);
        }
    },

    deleteLead(id) {
        const leads = this.getLeads();
        const filtered = leads.filter(l => l.id !== id);
        this.setLeads(filtered);
    },

    // Calls
    getCalls(userId = null) {
        const calls = this.get('calls') || [];
        if (userId) {
            return calls.filter(c => c.userId === userId);
        }
        return calls;
    },

    setCalls(calls) {
        this.set('calls', calls);
    },

    addCall(call) {
        const calls = this.getCalls();
        calls.push(call);
        this.setCalls(calls);
    },

    updateCall(id, updates) {
        const calls = this.getCalls();
        const index = calls.findIndex(c => c.id === id);
        if (index !== -1) {
            calls[index] = { ...calls[index], ...updates };
            this.setCalls(calls);
        }
    },

    deleteCall(id) {
        const calls = this.getCalls();
        const filtered = calls.filter(c => c.id !== id);
        this.setCalls(filtered);
    },

    // Follow-ups
    getFollowups(userId = null) {
        const followups = this.get('followups') || [];
        if (userId) {
            return followups.filter(f => f.userId === userId);
        }
        return followups;
    },

    setFollowups(followups) {
        this.set('followups', followups);
    },

    addFollowup(followup) {
        const followups = this.getFollowups();
        followups.push(followup);
        this.setFollowups(followups);
    },

    updateFollowup(id, updates) {
        const followups = this.getFollowups();
        const index = followups.findIndex(f => f.id === id);
        if (index !== -1) {
            followups[index] = { ...followups[index], ...updates };
            this.setFollowups(followups);
        }
    },

    deleteFollowup(id) {
        const followups = this.getFollowups();
        const filtered = followups.filter(f => f.id !== id);
        this.setFollowups(filtered);
    },

    // Reflections
    getReflections(userId = null) {
        const reflections = this.get('reflections') || [];
        if (userId) {
            return reflections.filter(r => r.userId === userId);
        }
        return reflections;
    },

    setReflections(reflections) {
        this.set('reflections', reflections);
    },

    addReflection(reflection) {
        const reflections = this.getReflections();
        reflections.push(reflection);
        this.setReflections(reflections);
    },

    updateReflection(id, updates) {
        const reflections = this.getReflections();
        const index = reflections.findIndex(r => r.id === id);
        if (index !== -1) {
            reflections[index] = { ...reflections[index], ...updates };
            this.setReflections(reflections);
        }
    },

    deleteReflection(id) {
        const reflections = this.getReflections();
        const filtered = reflections.filter(r => r.id !== id);
        this.setReflections(filtered);
    },

    // Monthly Data
    getMonthlyData(userId = null) {
        const monthlyData = this.get('monthlyData') || [];
        if (userId) {
            return monthlyData.filter(m => m.userId === userId);
        }
        return monthlyData;
    },

    setMonthlyData(monthlyData) {
        this.set('monthlyData', monthlyData);
    },

    addMonthlyData(data) {
        const monthlyData = this.getMonthlyData();
        monthlyData.push(data);
        this.setMonthlyData(monthlyData);
    },

    updateMonthlyData(id, updates) {
        const monthlyData = this.getMonthlyData();
        const index = monthlyData.findIndex(m => m.id === id);
        if (index !== -1) {
            monthlyData[index] = { ...monthlyData[index], ...updates };
            this.setMonthlyData(monthlyData);
        }
    },

    // Notifications
    getNotifications(userId = null) {
        const notifications = this.get('notifications') || [];
        if (userId) {
            return notifications.filter(n => n.userId === userId);
        }
        return notifications;
    },

    setNotifications(notifications) {
        this.set('notifications', notifications);
    },

    addNotification(notification) {
        const notifications = this.getNotifications();
        notifications.push(notification);
        this.setNotifications(notifications);
    },

    markNotificationAsRead(id) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index].read = true;
            this.setNotifications(notifications);
        }
    },

    deleteNotification(id) {
        const notifications = this.getNotifications();
        const filtered = notifications.filter(n => n.id !== id);
        this.setNotifications(filtered);
    },

    // Pending registrations
    getPendingRegistrations() {
        return this.get('pendingRegistrations') || [];
    },

    setPendingRegistrations(registrations) {
        this.set('pendingRegistrations', registrations);
    },

    addPendingRegistration(registration) {
        const registrations = this.getPendingRegistrations();
        registrations.push(registration);
        this.setPendingRegistrations(registrations);
    },

    removePendingRegistration(id) {
        const registrations = this.getPendingRegistrations();
        const filtered = registrations.filter(r => r.id !== id);
        this.setPendingRegistrations(filtered);
    }
};

// Initialize database
db.init();
