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
                    <button class="btn btn-primary" onclick="usersModule.showAddForm()">
                        <i class="fas fa-user-plus"></i> Neuer Benutzer
                    </button>
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
                                    <button class="btn btn-primary" onclick="usersModule.edit('${u.id}')">
                                        <i class="fas fa-edit"></i>
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
        alert(`Benutzer: ${user.name}\nE-Mail: ${user.email}\nRolle: ${user.role}`);
    }
};
