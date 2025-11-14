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
                                <td><strong>${u.name || 'Kein Name'}</strong></td>
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
        const modalHtml = `
            <div id="userFormModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;">
                    <h2>Neuer Benutzer</h2>
                    <form id="createUserForm">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="userName" name="userName" required placeholder="z.B. Max Mustermann">
                        </div>
                        <div class="form-group">
                            <label>E-Mail *</label>
                            <input type="email" id="userEmail" name="userEmail" required placeholder="z.B. max.mustermann@healthbox.ae">
                        </div>
                        <div class="form-group">
                            <label>Passwort *</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="userPassword" name="userPassword" required minlength="8" placeholder="Mindestens 8 Zeichen">
                                <button type="button" class="password-toggle" onclick="usersModule.togglePassword('userPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small style="color: var(--gray-600);">Das Passwort kann später geändert werden</small>
                        </div>
                        <div class="form-group">
                            <label>Rolle *</label>
                            <select id="userRole" name="userRole" required>
                                <option value="">Bitte wählen...</option>
                                <option value="partner">Partner</option>
                                <option value="teamleader">Teamleader</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="button" class="btn btn-success" onclick="usersModule.save(event)">
                            <i class="fas fa-save"></i> Benutzer erstellen
                        </button>
                        <button type="button" class="btn" onclick="usersModule.closeModal()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    closeModal() {
        const modal = document.getElementById('userFormModal') || document.getElementById('editUserFormModal');
        if (modal) modal.remove();
    },

    save(e) {
        if (e) e.preventDefault();
        
        console.log('═══ SAVE FUNCTION CALLED ═══');
        
        const nameEl = document.getElementById('userName');
        const emailEl = document.getElementById('userEmail');
        const passwordEl = document.getElementById('userPassword');
        const roleEl = document.getElementById('userRole');

        console.log('Elemente gefunden:', {
            name: !!nameEl,
            email: !!emailEl,
            password: !!passwordEl,
            role: !!roleEl
        });

        if (!nameEl || !emailEl || !passwordEl || !roleEl) {
            alert('❌ Formular-Fehler! Bitte versuchen Sie es erneut.');
            return;
        }

        const name = nameEl.value.trim();
        const email = emailEl.value.trim().toLowerCase();
        const password = passwordEl.value;
        const role = roleEl.value;

        console.log('Eingabe-Werte:', { name, email, passwordLength: password.length, role });

        if (!name) {
            alert('❌ Bitte geben Sie einen Namen ein!');
            return;
        }
        if (!email) {
            alert('❌ Bitte geben Sie eine E-Mail ein!');
            return;
        }
        if (!password || password.length < 8) {
            alert('❌ Passwort muss mindestens 8 Zeichen lang sein!');
            return;
        }
        if (!role) {
            alert('❌ Bitte wählen Sie eine Rolle aus!');
            return;
        }

        const user = {
            id: generateId('user'),
            name: name,
            email: email,
            password: password,
            role: role,
            status: 'active',
            created: Date.now()
        };
        
        console.log('✅ User-Objekt erstellt:', user);
        
        try {
            DB.add('users', user);
            console.log('✅ Benutzer in DB gespeichert');
            
            showToast('success', `Benutzer "${user.name}" erfolgreich erstellt`);
            authApp.logActivity('user_created', `Benutzer erstellt: ${user.name}`);
            
            const modal = document.getElementById('userFormModal');
            if (modal) modal.remove();
            
            app.navigateTo('users');
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            alert('❌ Fehler beim Speichern! Siehe Konsole für Details.');
        }
    },

    edit(id) {
        const user = DB.findById('users', id);
        if (!user) {
            alert('❌ Benutzer nicht gefunden!');
            return;
        }

        document.body.insertAdjacentHTML('beforeend', `
            <div id="editUserFormModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="event.target.id === 'editUserFormModal' && this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;"
                     onclick="event.stopPropagation()">
                    <h2>Benutzer bearbeiten</h2>
                    <form id="editUserForm" onsubmit="usersModule.update(event, '${user.id}')">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="editUserName" name="editUserName" value="${escapeHtml(user.name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label>E-Mail *</label>
                            <input type="email" id="editUserEmail" name="editUserEmail" value="${escapeHtml(user.email)}" required>
                        </div>
                        <div class="form-group">
                            <label>Aktuelles Passwort anzeigen</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="currentPassword" value="${escapeHtml(user.password)}" readonly style="background: var(--gray-50);">
                                <button type="button" class="password-toggle" onclick="usersModule.togglePassword('currentPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small style="color: var(--gray-600);">Dies ist das aktuelle Passwort des Benutzers</small>
                        </div>
                        <div class="form-group">
                            <label>Neues Passwort (optional)</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="editUserPassword" name="editUserPassword" minlength="8" placeholder="Leer lassen für keine Änderung">
                                <button type="button" class="password-toggle" onclick="usersModule.togglePassword('editUserPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small style="color: var(--gray-600);">Nur ausfüllen, wenn Sie das Passwort ändern möchten</small>
                        </div>
                        <div class="form-group">
                            <label>Rolle *</label>
                            <select id="editUserRole" name="editUserRole" required>
                                <option value="partner" ${user.role === 'partner' ? 'selected' : ''}>Partner</option>
                                <option value="teamleader" ${user.role === 'teamleader' ? 'selected' : ''}>Teamleader</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status *</label>
                            <select id="editUserStatus" name="editUserStatus" required>
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktiv</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inaktiv</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> Änderungen speichern
                        </button>
                        <button type="button" class="btn" onclick="document.getElementById('editUserFormModal').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    update(e, userId) {
        e.preventDefault();
        
        const name = document.getElementById('editUserName').value.trim();
        const email = document.getElementById('editUserEmail').value.trim().toLowerCase();
        const role = document.getElementById('editUserRole').value;
        const status = document.getElementById('editUserStatus').value;

        if (!name || !email || !role || !status) {
            alert('❌ Bitte füllen Sie alle Pflichtfelder aus!');
            return;
        }

        const updates = {
            name: name,
            email: email,
            role: role,
            status: status
        };

        // Nur Passwort updaten, wenn ein neues eingegeben wurde
        const newPassword = document.getElementById('editUserPassword').value;
        if (newPassword && newPassword.trim().length > 0) {
            updates.password = newPassword.trim();
            console.log('Passwort wird geändert');
        }

        console.log('Benutzer wird aktualisiert:', updates);

        DB.update('users', userId, updates);
        showToast('success', `Benutzer "${updates.name}" aktualisiert`);
        authApp.logActivity('user_updated', `Benutzer aktualisiert: ${updates.name}`);
        
        document.getElementById('editUserFormModal').remove();
        app.navigateTo('users');
    },

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.parentElement.querySelector('.password-toggle');
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

        if (confirm(`⚠️ Benutzer "${user.name}" wirklich löschen?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
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

        if (confirm(`⚠️ ALLE ${demoUsers.length} Demo-Benutzer löschen?\n\nBenutzer:\n${demoUsers.map(u => '• ' + u.name).join('\n')}\n\nDer Haupt-Admin-Account und Ihr eigener Account bleiben erhalten.\n\nDieser Vorgang kann nicht rückgängig gemacht werden!`)) {
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
