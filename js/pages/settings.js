// ===================================
// Settings Page
// ===================================

const settingsPage = {
    render() {
        const user = authApp.currentUser;
        const settings = this.getSettings();

        return `
            <div class="page-header">
                <h1><i class="fas fa-cog"></i> Einstellungen</h1>
                <p>Benachrichtigungen und Präferenzen verwalten</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-bell"></i> Benachrichtigungen</h2>
                </div>

                <form id="settingsForm">
                    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--grey-light);">
                        <div>
                            <strong>Follow-up Erinnerungen</strong>
                            <p class="text-muted" style="margin: 5px 0 0 0; font-size: 13px;">
                                Benachrichtigungen bei überfälligen Follow-ups
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyFollowups" ${settings.notifyFollowups ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--grey-light);">
                        <div>
                            <strong>Neue Leads</strong>
                            <p class="text-muted" style="margin: 5px 0 0 0; font-size: 13px;">
                                Benachrichtigung wenn neue Leads hinzugefügt werden
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyNewLeads" ${settings.notifyNewLeads ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--grey-light);">
                        <div>
                            <strong>Wöchentliche Zusammenfassung</strong>
                            <p class="text-muted" style="margin: 5px 0 0 0; font-size: 13px;">
                                Erhalten Sie eine wöchentliche Zusammenfassung Ihrer Aktivitäten
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyWeeklySummary" ${settings.notifyWeeklySummary ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    ${authApp.isTeamLeader() || authApp.isAdmin() ? `
                    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--grey-light);">
                        <div>
                            <strong>Team-Benachrichtigungen</strong>
                            <p class="text-muted" style="margin: 5px 0 0 0; font-size: 13px;">
                                Benachrichtigungen über Team-Aktivitäten
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyTeam" ${settings.notifyTeam ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    ` : ''}

                    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 15px;">
                        <div>
                            <strong>System-Benachrichtigungen</strong>
                            <p class="text-muted" style="margin: 5px 0 0 0; font-size: 13px;">
                                Wichtige System-Updates und Mitteilungen
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifySystem" ${settings.notifySystem ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Einstellungen speichern
                        </button>
                    </div>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-palette"></i> Darstellung</h2>
                </div>

                <div class="form-group">
                    <label for="language">Sprache</label>
                    <select id="language" disabled style="background: var(--grey-lighter);">
                        <option value="de">Deutsch</option>
                    </select>
                    <small class="text-muted">Weitere Sprachen in Entwicklung</small>
                </div>

                <div class="form-group">
                    <label for="dateFormat">Datumsformat</label>
                    <select id="dateFormat">
                        <option value="DD.MM.YYYY" ${settings.dateFormat === 'DD.MM.YYYY' ? 'selected' : ''}>DD.MM.YYYY (31.12.2025)</option>
                        <option value="MM/DD/YYYY" ${settings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (12/31/2025)</option>
                        <option value="YYYY-MM-DD" ${settings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (2025-12-31)</option>
                    </select>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="settingsPage.saveDateFormat()">
                        <i class="fas fa-save"></i> Speichern
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-database"></i> Daten & Privatsphäre</h2>
                </div>

                <div style="padding: 20px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px;">Daten exportieren</h3>
                    <p class="text-muted" style="margin-bottom: 15px;">
                        Laden Sie alle Ihre Daten als Backup herunter.
                    </p>
                    <button class="btn btn-secondary" onclick="settingsPage.exportAllData()">
                        <i class="fas fa-download"></i> Meine Daten exportieren (JSON)
                    </button>

                    ${authApp.isAdmin() ? `
                    <hr style="margin: 30px 0;">
                    
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--primary-gold);">
                        <i class="fas fa-crown"></i> Administrator-Funktionen
                    </h3>
                    <p class="text-muted" style="margin-bottom: 15px;">
                        <strong>Komplettes System exportieren/importieren</strong><br>
                        Exportieren Sie ALLE Systemdaten (Benutzer, Leads, etc.) um sie auf anderen Geräten zu importieren.
                    </p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="btn btn-gold" onclick="settingsPage.exportCompleteSystem()">
                            <i class="fas fa-file-export"></i> Komplett-Export (System)
                        </button>
                        <button class="btn btn-gold" onclick="settingsPage.importCompleteSystem()">
                            <i class="fas fa-file-import"></i> System importieren
                        </button>
                    </div>
                    <div class="info-text">
                        <i class="fas fa-info-circle"></i> Nutzen Sie dies, um Ihre Daten zwischen verschiedenen Geräten (Desktop, Handy, Tablet) oder Browsern (Chrome, Safari) zu synchronisieren.
                    </div>
                    ` : ''}

                    <hr style="margin: 30px 0;">

                    <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--danger);">Gefahrenzone</h3>
                    <p class="text-muted" style="margin-bottom: 15px;">
                        ⚠️ Diese Aktionen können nicht rückgängig gemacht werden!
                    </p>
                    <button class="btn btn-danger" onclick="settingsPage.deleteAllData()">
                        <i class="fas fa-trash"></i> Alle meine Daten löschen
                    </button>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
    },

    getSettings() {
        const userSettings = db.get(`settings_${authApp.currentUser.id}`);
        return userSettings || {
            notifyFollowups: true,
            notifyNewLeads: true,
            notifyWeeklySummary: true,
            notifyTeam: true,
            notifySystem: true,
            dateFormat: 'DD.MM.YYYY'
        };
    },

    saveSettings() {
        const settings = {
            notifyFollowups: document.getElementById('notifyFollowups').checked,
            notifyNewLeads: document.getElementById('notifyNewLeads').checked,
            notifyWeeklySummary: document.getElementById('notifyWeeklySummary').checked,
            notifyTeam: document.getElementById('notifyTeam')?.checked || false,
            notifySystem: document.getElementById('notifySystem').checked,
            dateFormat: this.getSettings().dateFormat
        };

        db.set(`settings_${authApp.currentUser.id}`, settings);
        utils.showToast('Einstellungen gespeichert!', 'success');
    },

    saveDateFormat() {
        const settings = this.getSettings();
        settings.dateFormat = document.getElementById('dateFormat').value;
        db.set(`settings_${authApp.currentUser.id}`, settings);
        utils.showToast('Datumsformat gespeichert!', 'success');
    },

    exportAllData() {
        const userId = authApp.currentUser.id;
        const allData = {
            user: authApp.currentUser,
            leads: db.getLeads(userId),
            calls: db.getCalls(userId),
            followups: db.getFollowups(userId),
            reflections: db.getReflections(userId),
            monthlyData: db.getMonthlyData(userId),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `healthbox_backup_${authApp.currentUser.name}_${utils.formatDate(new Date())}.json`;
        link.click();
        URL.revokeObjectURL(url);

        utils.showToast('Daten erfolgreich exportiert!', 'success');
    },

    deleteAllData() {
        if (!utils.confirm('⚠️ WARNUNG!\n\nMöchten Sie wirklich ALLE Ihre Daten löschen?\n\nDies umfasst:\n- Alle Leads\n- Alle Gespräche\n- Alle Follow-ups\n- Alle Reflexionen\n- Alle Monatsdaten\n\nDiese Aktion kann NICHT rückgängig gemacht werden!')) {
            return;
        }

        if (!utils.confirm('Sind Sie ABSOLUT sicher?\n\nGeben Sie zur Bestätigung "LÖSCHEN" ein:')) {
            return;
        }

        const userId = authApp.currentUser.id;

        // Delete all user data
        const leads = db.getLeads().filter(l => l.userId !== userId);
        const calls = db.getCalls().filter(c => c.userId !== userId);
        const followups = db.getFollowups().filter(f => f.userId !== userId);
        const reflections = db.getReflections().filter(r => r.userId !== userId);
        const monthlyData = db.getMonthlyData().filter(m => m.userId !== userId);

        db.setLeads(leads);
        db.setCalls(calls);
        db.setFollowups(followups);
        db.setReflections(reflections);
        db.setMonthlyData(monthlyData);

        utils.showToast('Alle Ihre Daten wurden gelöscht.', 'warning');
        
        // Reload dashboard
        app.navigateTo('dashboard');
    },

    // ========== ADMIN ONLY: Complete System Export/Import ==========

    exportCompleteSystem() {
        if (!authApp.isAdmin()) {
            utils.showToast('Nur für Administratoren', 'error');
            return;
        }

        // Export EVERYTHING from localStorage
        const completeSystem = {
            users: db.getUsers(),
            leads: db.getLeads(),
            calls: db.getCalls(),
            followups: db.getFollowups(),
            reflections: db.getReflections(),
            monthlyData: db.getMonthlyData(),
            notifications: db.getNotifications(),
            materials: db.get('materials') || [],
            initialized: localStorage.getItem('healthbox_initialized'),
            exportDate: new Date().toISOString(),
            exportedBy: authApp.currentUser.email,
            version: '2.0.2'
        };

        // Export all settings for all users
        const allSettings = {};
        completeSystem.users.forEach(user => {
            const userSettings = db.get(`settings_${user.id}`);
            if (userSettings) {
                allSettings[user.id] = userSettings;
            }
        });
        completeSystem.settings = allSettings;

        const dataStr = JSON.stringify(completeSystem, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `healthbox_COMPLETE_SYSTEM_${new Date().getTime()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        utils.showToast('Komplettes System exportiert! Nutzen Sie diese Datei um auf anderen Geräten zu importieren.', 'success');
    },

    importCompleteSystem() {
        if (!authApp.isAdmin()) {
            utils.showToast('Nur für Administratoren', 'error');
            return;
        }

        if (!confirm('⚠️ WICHTIG!\n\nDieser Import wird ALLE aktuellen Daten auf diesem Gerät ÜBERSCHREIBEN.\n\nNur fortfahren, wenn Sie ein Backup haben oder dies ein neues Gerät ist!\n\nFortfahren?')) {
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate
                    if (!importedData.users || !importedData.version) {
                        utils.showToast('Ungültige Backup-Datei!', 'error');
                        return;
                    }

                    // Import all data
                    db.setUsers(importedData.users);
                    db.setLeads(importedData.leads || []);
                    db.setCalls(importedData.calls || []);
                    db.setFollowups(importedData.followups || []);
                    db.setReflections(importedData.reflections || []);
                    db.setMonthlyData(importedData.monthlyData || []);
                    db.setNotifications(importedData.notifications || []);
                    db.set('materials', importedData.materials || []);
                    localStorage.setItem('healthbox_initialized', 'true');

                    // Import settings
                    if (importedData.settings) {
                        Object.keys(importedData.settings).forEach(userId => {
                            db.set(`settings_${userId}`, importedData.settings[userId]);
                        });
                    }

                    utils.showToast('System erfolgreich importiert! Seite wird neu geladen...', 'success');
                    
                    setTimeout(() => {
                        location.reload();
                    }, 2000);

                } catch (error) {
                    console.error('Import error:', error);
                    utils.showToast('Fehler beim Import: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
};
