// Settings Module
const settingsModule = {
    render(container) {
        const user = authApp.currentUser;
        const settings = DB.get('settings');

        container.innerHTML = `
            <div class="card">
                <h2>Einstellungen</h2>
                
                <h3 style="margin-top: 30px;">Profil</h3>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="settingsName" value="${user.name}">
                </div>
                <div class="form-group">
                    <label>E-Mail</label>
                    <input type="email" id="settingsEmail" value="${user.email}">
                </div>
                <button class="btn btn-primary" onclick="settingsModule.saveProfile()">
                    Profil speichern
                </button>

                <h3 style="margin-top: 30px;">Provisionen</h3>
                <div class="form-group">
                    <label>Standard-Provision (%)</label>
                    <input type="number" id="settingsCommission" value="${settings.defaultCommission}" min="0" max="100" step="0.5">
                </div>
                <div class="form-group">
                    <label>Team-Provision (%)</label>
                    <input type="number" id="settingsTeamCommission" value="${settings.teamCommission}" min="0" max="100" step="0.5">
                </div>
                <button class="btn btn-primary" onclick="settingsModule.saveSettings()">
                    Einstellungen speichern
                </button>

                <h3 style="margin-top: 30px;">Benachrichtigungen</h3>
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                        <input type="checkbox" id="settingsEmailNotif" ${settings.notifications.email ? 'checked' : ''}>
                        <span>E-Mail Benachrichtigungen</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; margin-top: 12px;">
                        <input type="checkbox" id="settingsInAppNotif" ${settings.notifications.inApp ? 'checked' : ''}>
                        <span>In-App Benachrichtigungen</span>
                    </label>
                </div>
                <button class="btn btn-primary" onclick="settingsModule.saveSettings()" style="margin-top: 16px;">
                    Benachrichtigungen speichern
                </button>

                <h3 style="margin-top: 30px; color: var(--danger-red);">Gefahrenzone</h3>
                <button class="btn btn-danger" onclick="settingsModule.resetData()">
                    <i class="fas fa-exclamation-triangle"></i> Alle Daten zurücksetzen
                </button>
            </div>
        `;
    },

    saveProfile() {
        const name = document.getElementById('settingsName').value;
        const email = document.getElementById('settingsEmail').value;

        DB.update('users', authApp.currentUser.id, { name, email });
        authApp.currentUser.name = name;
        authApp.currentUser.email = email;
        localStorage.setItem('current_user', JSON.stringify(authApp.currentUser));

        showToast('success', 'Profil gespeichert');
        authApp.logActivity('settings', 'Profil aktualisiert');
    },

    saveSettings() {
        const settings = {
            defaultCommission: parseFloat(document.getElementById('settingsCommission').value),
            teamCommission: parseFloat(document.getElementById('settingsTeamCommission').value),
            currency: 'EUR',
            language: 'de',
            notifications: {
                email: document.getElementById('settingsEmailNotif').checked,
                inApp: document.getElementById('settingsInAppNotif').checked
            }
        };

        DB.set('settings', settings);
        showToast('success', 'Einstellungen gespeichert');
        authApp.logActivity('settings', 'Einstellungen aktualisiert');
    },

    resetData() {
        if (confirm('⚠️ WARNUNG: Alle Daten werden gelöscht!\\n\\nDies kann nicht rückgängig gemacht werden.\\n\\nMöchten Sie fortfahren?')) {
            if (confirm('Sind Sie WIRKLICH sicher? Letzte Chance!')) {
                DB.resetToDemo();
                showToast('success', 'Daten wurden zurückgesetzt');
                authApp.logActivity('settings', 'Datenbank zurückgesetzt');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }
};
