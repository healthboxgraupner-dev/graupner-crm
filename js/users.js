// Users Module (Admin only)
const usersModule = {
    render(container) {
        if (authApp.currentUser.role !== 'admin') {
            container.innerHTML = '<div class="card"><p>Keine Berechtigung</p></div>';
            return;
        }

        const users = DB.get('users');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Benutzerverwaltung</h2>
                    <div>
                        <button class="btn btn-primary" onclick="usersModule.showAddForm()" style="margin-right: 10px;">
                            <i class="fas fa-user-plus"></i> Neuer Benutzer
                        </button>
                        <button class="btn btn-danger" onclick="usersModule.deleteAllDemoUsers()">
                            <i class="fas fa-trash-alt"></i> Alle Demo-Benutzer löschen
                        </button>
                    </div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>E-Mail</th>
                            <th>Rolle</th>
                            <th>Status</th>
                            <th>Erstellt</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td>${u.email}</td>
                                <td><span class="badge ${u.role}">${u.role}</span></td>
                                <td><span class="badge ${u.status}">${u.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span></td>
                                <td>${formatDate(u.created)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="usersModule.edit('${u.id}')" style="margin-right: 8px;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="usersModule.deleteUser('${u.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showAddForm() {
        document.body.insertAdjacentHTML('beforeend', `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;"
                     onclick="event.stopPropagation()">
                    <h2>Neuer Benutzer</h2>
                    <form onsubmit="usersModule.save(event)">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="userName" required>
                        </div>
                        <div class="form-group">
                            <label>E-Mail *</label>
                            <input type="email" id="userEmail" required>
                        </div>
                        <div class="form-group">
                            <label>Passwort *</label>
                            <input type="password" id="userPassword" required minlength="8">
                        </div>
                        <div class="form-group">
                            <label>Rolle *</label>
                            <select id="userRole" required>
                                <option value="partner">Partner</option>
                                <option value="teamleader">Teamleader</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-success">Benutzer erstellen</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    save(e) {
        e.preventDefault();
        const user = {
            id: generateId('user'),
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value,
            status: 'active',
            created: Date.now()
        };
        
        DB.add('users', user);
        showToast('success', 'Benutzer erstellt');
        authApp.logActivity('user_created', `Benutzer erstellt: ${user.name}`);
        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('users');
    },

    edit(id) {
        const user = DB.findById('users', id);
        if (!user) return;

        document.body.insertAdjacentHTML('beforeend', `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;"
                     onclick="event.stopPropagation()">
                    <h2>Benutzer bearbeiten</h2>
                    <form onsubmit="usersModule.update(event, '${user.id}')">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="editUserName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label>E-Mail *</label>
                            <input type="email" id="editUserEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label>Neues Passwort (leer lassen für keine Änderung)</label>
                            <input type="password" id="editUserPassword" minlength="8" placeholder="Optional">
                        </div>
                        <div class="form-group">
                            <label>Rolle *</label>
                            <select id="editUserRole" required>
                                <option value="partner" ${user.role === 'partner' ? 'selected' : ''}>Partner</option>
                                <option value="teamleader" ${user.role === 'teamleader' ? 'selected' : ''}>Teamleader</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status *</label>
                            <select id="editUserStatus" required>
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktiv</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inaktiv</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-success">Speichern</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    update(e, userId) {
        e.preventDefault();
        
        const updates = {
            name: document.getElementById('editUserName').value,
            email: document.getElementById('editUserEmail').value,
            role: document.getElementById('editUserRole').value,
            status: document.getElementById('editUserStatus').value
        };

        // Nur Passwort updaten, wenn ein neues eingegeben wurde
        const newPassword = document.getElementById('editUserPassword').value;
        if (newPassword) {
            updates.password = newPassword;
        }

        DB.update('users', userId, updates);
        showToast('success', 'Benutzer aktualisiert');
        authApp.logActivity('user_updated', `Benutzer aktualisiert: ${updates.name}`);
        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('users');
    },

    deleteUser(id) {
        const user = DB.findById('users', id);
        if (!user) return;

        // Verhindere Löschen des eigenen Accounts
        if (id === authApp.currentUser.id) {
            alert('❌ Sie können Ihren eigenen Account nicht löschen!');
            return;
        }

        // Verhindere Löschen des Admin-Accounts
        if (user.email === 'admin@healthbox.ae') {
            alert('❌ Der Haupt-Admin-Account kann nicht gelöscht werden!');
            return;
        }

        if (confirm(`⚠️ Benutzer "${user.name}" wirklich löschen?\\n\\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
            DB.delete('users', id);
            showToast('success', `Benutzer "${user.name}" gelöscht`);
            authApp.logActivity('user_deleted', `Benutzer gelöscht: ${user.name}`);
            app.navigateTo('users');
        }
    },

    deleteAllDemoUsers() {
        const users = DB.get('users');
        const demoUsers = users.filter(u => 
            u.email !== 'admin@healthbox.ae' && 
            u.id !== authApp.currentUser.id
        );

        if (demoUsers.length === 0) {
            alert('ℹ️ Keine Demo-Benutzer zum Löschen vorhanden.');
            return;
        }

        if (confirm(`⚠️ ALLE ${demoUsers.length} Demo-Benutzer löschen?\\n\\nBenutzer:\\n${demoUsers.map(u => '• ' + u.name).join('\\n')}\\n\\nDer Haupt-Admin-Account und Ihr eigener Account bleiben erhalten.\\n\\nDieser Vorgang kann nicht rückgängig gemacht werden!`)) {
            let deleted = 0;
            demoUsers.forEach(user => {
                DB.delete('users', user.id);
                deleted++;
            });
            
            showToast('success', `${deleted} Demo-Benutzer gelöscht`);
            authApp.logActivity('users_bulk_deleted', `${deleted} Demo-Benutzer gelöscht`);
            app.navigateTo('users');
        }
    }
};
