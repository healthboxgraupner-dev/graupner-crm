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
        console.log('═══ SHOW ADD FORM CALLED ═══');
        
        // Entferne ALLE alten Modals falls vorhanden
        const oldModals = document.querySelectorAll('#userFormModal, #editUserFormModal');
        oldModals.forEach(modal => modal.remove());
        console.log('✅ Alte Modals entfernt:', oldModals.length);

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'userFormModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;">
                <h2>Neuer Benutzer</h2>
                <form id="createUserForm">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" id="userName" name="name" required placeholder="z.B. Max Mustermann" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>E-Mail *</label>
                        <input type="email" id="userEmail" name="email" required placeholder="z.B. max.mustermann@healthbox.ae" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Passwort *</label>
                        <div class="password-input-wrapper">
                            <input type="password" id="userPassword" name="password" required minlength="8" placeholder="Mindestens 8 Zeichen" autocomplete="new-password">
                            <button type="button" class="password-toggle" id="togglePasswordBtn">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <small style="color: var(--gray-600);">Das Passwort kann später geändert werden</small>
                    </div>
                    <div class="form-group">
                        <label>Rolle *</label>
                        <select id="userRole" name="role" required>
                            <option value="">Bitte wählen...</option>
                            <option value="partner">Partner</option>
                            <option value="teamleader">Teamleader</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success" id="createUserBtn">
                        <i class="fas fa-save"></i> Benutzer erstellen
                    </button>
                    <button type="button" class="btn" id="cancelBtn" style="margin-left: 10px;">
                        Abbrechen
                    </button>
                </form>
            </div>
        `;
        
        // Append to body
        document.body.appendChild(modal);
        console.log('✅ Modal appended to body');
        
        // Set up event listeners
        const form = document.getElementById('createUserForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const toggleBtn = document.getElementById('togglePasswordBtn');
        
        // Form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Form submitted via event listener');
            this.handleCreateUser(e);
        });
        
        // Cancel button
        cancelBtn.addEventListener('click', () => {
            console.log('❌ Cancel clicked');
            this.closeModal();
        });
        
        // Password toggle
        toggleBtn.addEventListener('click', () => {
            this.togglePassword('userPassword');
        });
        
        // Focus first input
        setTimeout(() => {
            const nameInput = document.getElementById('userName');
            if (nameInput) {
                nameInput.focus();
                console.log('✅ Name input focused');
            }
        }, 100);
        
        console.log('✅ All event listeners attached');
    },

    handleCreateUser(event) {
        console.log('═══ HANDLE CREATE USER FUNCTION CALLED ═══');
        
        // Prevent form submission
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const nameEl = document.getElementById('userName');
        const emailEl = document.getElementById('userEmail');
        const passwordEl = document.getElementById('userPassword');
        const roleEl = document.getElementById('userRole');

        console.log('Form elements found:', {
            nameEl: !!nameEl,
            emailEl: !!emailEl,
            passwordEl: !!passwordEl,
            roleEl: !!roleEl
        });

        if (!nameEl || !emailEl || !passwordEl || !roleEl) {
            console.error('❌ Formular-Elemente nicht gefunden!');
            alert('❌ Formular-Fehler! Bitte schließen und neu öffnen.');
            return false;
        }

        // Debug: Log the actual values before trimming
        console.log('Raw values:', {
            nameValue: nameEl.value,
            emailValue: emailEl.value,
            passwordValue: passwordEl.value,
            roleValue: roleEl.value
        });

        // Safely get values with fallback
        const name = (nameEl.value || '').trim();
        const email = (emailEl.value || '').trim().toLowerCase();
        const password = passwordEl.value || '';
        const role = roleEl.value || '';

        console.log('Eingabe-Werte:', { 
            name: name, 
            email: email, 
            passwordLength: password.length, 
            role: role 
        });

        // Validation
        if (!name || name.length === 0) {
            alert('❌ Bitte geben Sie einen Namen ein!');
            nameEl.focus();
            return false;
        }
        if (!email || !email.includes('@')) {
            alert('❌ Bitte geben Sie eine gültige E-Mail ein!');
            emailEl.focus();
            return false;
        }
        if (!password || password.length < 8) {
            alert('❌ Passwort muss mindestens 8 Zeichen lang sein!');
            passwordEl.focus();
            return false;
        }
        if (!role || role === '') {
            alert('❌ Bitte wählen Sie eine Rolle aus!');
            roleEl.focus();
            return false;
        }

        // Check if email already exists
        const existingUsers = DB.get('users');
        console.log('Existing users count:', existingUsers.length);
        
        const emailExists = existingUsers.find(u => u.email.toLowerCase() === email);
        if (emailExists) {
            alert('❌ Diese E-Mail-Adresse wird bereits verwendet!');
            emailEl.focus();
            return false;
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
            console.log('✅ DB.add() aufgerufen');
            
            // Verify it was saved
            const allUsers = DB.get('users');
            console.log('✅ Users nach Speicherung:', allUsers.length);
            
            const saved = DB.findById('users', user.id);
            console.log('✅ Verifikation - Benutzer gefunden:', !!saved);
            
            if (saved) {
                console.log('✅ ERFOLG: Benutzer wurde erfolgreich gespeichert!');
                showToast('success', `Benutzer "${user.name}" erfolgreich erstellt!`);
                authApp.logActivity('user_created', `Benutzer erstellt: ${user.name}`);
                
                this.closeModal();
                app.navigateTo('users');
            } else {
                console.error('❌ Benutzer wurde nicht gefunden nach Speicherung');
                alert('❌ Fehler: Benutzer konnte nicht verifiziert werden!');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            alert('❌ Fehler beim Speichern! Details in der Konsole.');
        }
        
        return false;
    },

    closeModal() {
        console.log('🔒 Closing modal...');
        const modals = document.querySelectorAll('#userFormModal, #editUserFormModal');
        console.log('📋 Modals found to close:', modals.length);
        modals.forEach(modal => modal.remove());
        console.log('✅ All modals closed');
    },

    edit(id) {
        const user = DB.findById('users', id);
        if (!user) {
            alert('❌ Benutzer nicht gefunden!');
            return;
        }

        // Entferne altes Modal falls vorhanden
        const oldModal = document.getElementById('editUserFormModal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div id="editUserFormModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <h2>Benutzer bearbeiten</h2>
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" id="editUserName" value="${escapeHtml(user.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>E-Mail *</label>
                        <input type="email" id="editUserEmail" value="${escapeHtml(user.email)}" required>
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
                            <input type="password" id="editUserPassword" minlength="8" placeholder="Leer lassen für keine Änderung">
                            <button type="button" class="password-toggle" onclick="usersModule.togglePassword('editUserPassword')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <small style="color: var(--gray-600);">Nur ausfüllen, wenn Sie das Passwort ändern möchten</small>
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
                    <button type="button" class="btn btn-success" onclick="usersModule.updateUser('${user.id}')">
                        <i class="fas fa-save"></i> Änderungen speichern
                    </button>
                    <button type="button" class="btn" onclick="usersModule.closeModal()" style="margin-left: 10px;">
                        Abbrechen
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    updateUser(userId) {
        console.log('═══ UPDATE USER FUNCTION CALLED ═══');
        
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
            console.log('✅ Passwort wird geändert');
        }

        console.log('Updates:', updates);

        try {
            DB.update('users', userId, updates);
            console.log('✅ Benutzer aktualisiert');
            
            showToast('success', `Benutzer "${updates.name}" aktualisiert`);
            authApp.logActivity('user_updated', `Benutzer aktualisiert: ${updates.name}`);
            
            this.closeModal();
            app.navigateTo('users');
        } catch (error) {
            console.error('❌ Fehler:', error);
            alert('❌ Fehler beim Speichern!');
        }
    },

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const wrapper = input.parentElement;
        const button = wrapper.querySelector('.password-toggle');
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

// Globale createUser Funktion als Fallback
window.createUserNow = function() {
    console.log('═══ GLOBALE CREATE USER FUNCTION ═══');
    
    const name = document.getElementById('userName')?.value.trim();
    const email = document.getElementById('userEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('userPassword')?.value;
    const role = document.getElementById('userRole')?.value;

    console.log('Werte:', { name, email, passwordLength: password?.length, role });

    if (!name || !email || !password || !role) {
        alert('❌ Bitte füllen Sie alle Felder aus!');
        return;
    }

    if (password.length < 8) {
        alert('❌ Passwort muss mindestens 8 Zeichen haben!');
        return;
    }

    const user = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        role: role,
        status: 'active',
        created: Date.now()
    };
    
    console.log('User-Objekt:', user);
    
    const users = DB.get('users');
    users.push(user);
    localStorage.setItem('crm_users', JSON.stringify(users));
    
    console.log('✅ Benutzer gespeichert');
    
    alert(`✅ Benutzer erstellt!\n\nName: ${name}\nE-Mail: ${email}\nPasswort: ${password}\nRolle: ${role}`);
    
    document.getElementById('userFormModal')?.remove();
    app.navigateTo('users');
};
