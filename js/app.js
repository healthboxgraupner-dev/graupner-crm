// ===================================
// Main Application Logic
// ===================================

const app = {
    currentPage: 'dashboard',

    init() {
        this.navigateTo('dashboard');
        this.updateNotificationBadge();
        
        // Auto-refresh notifications every minute
        setInterval(() => this.updateNotificationBadge(), 60000);
    },

    navigateTo(page) {
        this.currentPage = page;
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event?.target?.classList.add('active');

        // Load page content
        const pageContent = document.getElementById('pageContent');
        
        switch(page) {
            case 'dashboard':
                pageContent.innerHTML = dashboardPage.render();
                dashboardPage.init();
                break;
            case 'leads':
                pageContent.innerHTML = leadsPage.render();
                leadsPage.init();
                break;
            case 'calls':
                pageContent.innerHTML = callsPage.render();
                callsPage.init();
                break;
            case 'followup':
                pageContent.innerHTML = followupPage.render();
                followupPage.init();
                break;
            case 'reflection':
                pageContent.innerHTML = reflectionPage.render();
                reflectionPage.init();
                break;
            case 'monthly':
                pageContent.innerHTML = monthlyPage.render();
                monthlyPage.init();
                break;
            case 'income-calculator':
                pageContent.innerHTML = incomeCalculatorPage.render();
                incomeCalculatorPage.init();
                break;
            case 'admin':
                if (authApp.isAdmin()) {
                    pageContent.innerHTML = adminPage.render();
                    adminPage.init();
                } else {
                    utils.showToast('Sie haben keine Berechtigung für diesen Bereich', 'error');
                    this.navigateTo('dashboard');
                }
                break;
            case 'profile':
                pageContent.innerHTML = profilePage.render();
                profilePage.init();
                break;
            case 'settings':
                pageContent.innerHTML = settingsPage.render();
                settingsPage.init();
                break;
            case 'materials':
                pageContent.innerHTML = materialsPage.render();
                materialsPage.init();
                break;
            default:
                pageContent.innerHTML = '<h1>Seite nicht gefunden</h1>';
        }
    },

    toggleUserMenu() {
        const dropdown = document.getElementById('userMenuDropdown');
        dropdown.classList.toggle('show');
    },

    showProfile() {
        this.navigateTo('profile');
        document.getElementById('userMenuDropdown').classList.remove('show');
    },

    showSettings() {
        this.navigateTo('settings');
        document.getElementById('userMenuDropdown').classList.remove('show');
    },

    showNotifications() {
        const notifications = db.getNotifications(authApp.currentUser.id);
        const unread = notifications.filter(n => !n.read);

        if (notifications.length === 0) {
            utils.showToast('Keine Benachrichtigungen', 'info');
            return;
        }

        let html = `
            <div class="modal show">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-bell"></i> Benachrichtigungen</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
        `;

        notifications.forEach(notif => {
            const readClass = notif.read ? 'text-muted' : '';
            html += `
                <div class="card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div class="${readClass}">
                            <strong>${notif.type === 'reminder' ? '🔔' : '📧'} ${notif.message}</strong>
                            <p style="font-size: 12px; margin-top: 5px;">${utils.formatDate(notif.date)}</p>
                        </div>
                        ${!notif.read ? `
                            <button class="btn-icon btn-primary" onclick="app.markNotificationRead('${notif.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    markNotificationRead(id) {
        db.markNotificationAsRead(id);
        this.updateNotificationBadge();
        utils.showToast('Als gelesen markiert', 'success');
        
        // Refresh notification modal
        document.querySelector('.modal')?.remove();
        this.showNotifications();
    },

    updateNotificationBadge() {
        const notifications = db.getNotifications(authApp.currentUser.id);
        const unread = notifications.filter(n => !n.read);
        const badge = document.getElementById('notificationBadge');
        
        if (unread.length > 0) {
            badge.textContent = unread.length;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        // Check for overdue follow-ups
        this.checkOverdueFollowups();
    },

    checkOverdueFollowups() {
        const followups = db.getFollowups(authApp.currentUser.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        followups.forEach(followup => {
            if (followup.reminder && utils.isOverdue(followup.nextContact)) {
                // Check if notification already exists
                const notifications = db.getNotifications(authApp.currentUser.id);
                const exists = notifications.some(n => 
                    n.message.includes(followup.contact) && 
                    n.date === utils.getTodayString()
                );

                if (!exists) {
                    db.addNotification({
                        id: utils.generateId(),
                        userId: authApp.currentUser.id,
                        type: 'reminder',
                        message: `Follow-up mit ${followup.contact} ist überfällig!`,
                        date: utils.getTodayString(),
                        read: false
                    });
                }
            }
        });
    }
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userMenuDropdown')?.classList.remove('show');
    }
});
