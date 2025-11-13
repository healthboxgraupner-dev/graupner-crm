// ===================================
// Admin Page - User Management & Performance
// ===================================

const adminPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-user-shield"></i> Administration</h1>
                <p>Benutzerverwaltung und Performance-Analyse</p>
            </div>

            <div class="page-actions">
                <button class="btn btn-gold" onclick="exportData.exportPerformanceComparison()">
                    <i class="fas fa-file-excel"></i> Performance Export
                </button>
            </div>

            <!-- Pending Registrations -->
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-user-clock"></i> Ausstehende Registrierungen</h2>
                </div>
                <div id="pendingRegistrations"></div>
            </div>

            <!-- User Management -->
            <div class="card mt-20">
                <div class="card-header">
                    <h2><i class="fas fa-users-cog"></i> Benutzerverwaltung</h2>
                    <button class="btn btn-primary btn-sm" onclick="adminPage.addUser()">
                        <i class="fas fa-user-plus"></i> Benutzer hinzufügen
                    </button>
                </div>
                <div class="table-container">
                    <table class="data-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>E-Mail</th>
                                <th>Rolle</th>
                                <th>Status</th>
                                <th>Team-Leader</th>
                                <th>Telefon</th>
                                <th>Mitglied seit</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Performance Comparison -->
            <div class="card mt-20">
                <div class="card-header">
                    <h2><i class="fas fa-trophy"></i> Performance-Vergleich</h2>
                    <div>
                        <select id="performanceSort" onchange="adminPage.loadPerformance()">
                            <option value="revenue">Nach Umsatz</option>
                            <option value="leads">Nach Leads</option>
                            <option value="deals">Nach Abschlüssen</option>
                            <option value="conversion">Nach Conversion</option>
                        </select>
                    </div>
                </div>
                <div id="performanceComparison"></div>
            </div>
        `;
    },

    init() {
        this.loadPendingRegistrations();
        this.loadUsers();
        this.loadPerformance();
    },

    loadPendingRegistrations() {
        const pending = db.getPendingRegistrations();
        const container = document.getElementById('pendingRegistrations');
        
        // Debug log
        console.log('Pending Registrations:', pending);
        
        if (!pending || pending.length === 0) {
            container.innerHTML = `
                <p class="text-muted" style="padding: 20px; text-align: center;">
                    <i class="fas fa-check-circle"></i> Keine ausstehenden Registrierungen
                </p>
            `;
            return;
        }

        container.innerHTML = pending.map(reg => `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--warning);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom: 5px; color: var(--primary-blue);">${reg.name}</h3>
                        <p style="color: var(--grey-medium); margin-bottom: 5px;">
                            <i class="fas fa-envelope"></i> ${reg.email}
                        </p>
                        ${reg.phone ? `
                            <p style="color: var(--grey-medium); margin-bottom: 5px;">
                                <i class="fas fa-phone"></i> ${reg.phone}
                            </p>
                        ` : ''}
                        ${reg.teamLeaderId ? `
                            <p style="color: var(--grey-medium);">
                                <i class="fas fa-user-tie"></i> Team: ${db.getUserById(reg.teamLeaderId)?.name || 'Unbekannt'}
                            </p>
                        ` : ''}
                        <p class="text-muted" style="font-size: 12px; margin-top: 10px;">
                            Beantragt am ${utils.formatDate(new Date(reg.requestedAt))}
                        </p>
                    </div>
                    <div class="action-btns">
                        <button class="btn btn-success btn-sm" onclick="adminPage.approveRegistration('${reg.id}')">
                            <i class="fas fa-check"></i> Genehmigen
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="adminPage.rejectRegistration('${reg.id}')">
                            <i class="fas fa-times"></i> Ablehnen
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    approveRegistration(id) {
        const registration = db.getPendingRegistrations().find(r => r.id === id);
        if (!registration) return;

        const user = {
            id: utils.generateId(),
            name: registration.name,
            email: registration.email,
            password: registration.password,
            role: 'partner',
            status: 'active',
            phone: registration.phone || '',
            teamLeaderId: registration.teamLeaderId || null,
            createdAt: Date.now()
        };

        db.addUser(user);
        db.removePendingRegistration(id);
        
        utils.showToast(`Benutzer ${user.name} wurde genehmigt und aktiviert`, 'success');
        this.loadPendingRegistrations();
        this.loadUsers();
    },

    rejectRegistration(id) {
        if (utils.confirm('Möchten Sie diese Registrierung wirklich ablehnen?')) {
            const registration = db.getPendingRegistrations().find(r => r.id === id);
            db.removePendingRegistration(id);
            utils.showToast(`Registrierung von ${registration?.name || 'Benutzer'} wurde abgelehnt`, 'info');
            this.loadPendingRegistrations();
        }
    },

    loadUsers() {
        const users = db.getUsers();
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = users.map(user => {
            const teamLeader = user.teamLeaderId ? db.getUserById(user.teamLeaderId) : null;
            const roleLabel = {
                'admin': 'Administrator',
                'teamleader': 'Team-Leader',
                'partner': 'Partner'
            };
            
            return `
                <tr data-id="${user.id}">
                    <td><strong>${user.name}</strong></td>
                    <td>${user.email}</td>
                    <td>
                        <span class="status-badge ${user.role === 'admin' ? 'status-closed' : user.role === 'teamleader' ? 'status-offer' : 'status-new'}">
                            ${roleLabel[user.role] || user.role}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${user.status === 'active' ? 'active' : 'inactive'}">
                            ${utils.getStatusLabel(user.status)}
                        </span>
                    </td>
                    <td>${teamLeader ? teamLeader.name : '-'}</td>
                    <td>${user.phone || '-'}</td>
                    <td>${utils.formatDate(new Date(user.createdAt))}</td>
                    <td>
                        <div class="action-btns">
                            ${user.role !== 'admin' ? `
                                <button class="btn-icon btn-primary" onclick="adminPage.editUser('${user.id}')" title="Bearbeiten">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                                        onclick="adminPage.toggleUserStatus('${user.id}')" 
                                        title="${user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}">
                                    <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                                </button>
                                <button class="btn-icon btn-danger" onclick="adminPage.deleteUser('${user.id}')" title="Löschen">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : '<span class="text-muted">Admin</span>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    loadPerformance() {
        const sortBy = document.getElementById('performanceSort')?.value || 'revenue';
        const users = db.getUsers().filter(u => u.role !== 'admin');
        
        const performanceData = users.map(user => {
            const leads = db.getLeads(user.id);
            const calls = db.getCalls(user.id);
            const monthlyData = db.getMonthlyData(user.id);
            
            const totalLeads = leads.length;
            const totalCalls = calls.length;
            const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0);
            const totalDeals = monthlyData.reduce((sum, m) => sum + (m.closedDeals || 0), 0);
            const conversion = utils.calculateConversion(totalDeals, totalCalls);

            return {
                user,
                leads: totalLeads,
                calls: totalCalls,
                deals: totalDeals,
                revenue: totalRevenue,
                conversion: conversion
            };
        });

        // Sort
        performanceData.sort((a, b) => {
            switch(sortBy) {
                case 'leads': return b.leads - a.leads;
                case 'deals': return b.deals - a.deals;
                case 'conversion': return b.conversion - a.conversion;
                default: return b.revenue - a.revenue;
            }
        });

        const container = document.getElementById('performanceComparison');
        
        if (performanceData.length === 0) {
            container.innerHTML = '<p class="text-muted" style="padding: 20px; text-align: center;">Keine Daten verfügbar</p>';
            return;
        }

        // Find top performer
        const topPerformer = performanceData[0];

        container.innerHTML = `
            ${performanceData.map((data, index) => {
                const isTopPerformer = index === 0;
                const isTeamLeader = data.user.role === 'teamleader';
                
                return `
                    <div class="card" style="margin-bottom: 15px; border-left: 4px solid ${isTopPerformer ? 'var(--primary-gold)' : isTeamLeader ? 'var(--primary-blue)' : 'var(--grey-light)'};">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h3 style="margin-bottom: 5px; color: var(--primary-blue);">
                                    ${isTopPerformer ? '🏆 ' : ''}#${index + 1} ${data.user.name}
                                </h3>
                                <p style="color: var(--grey-medium); font-size: 14px;">
                                    ${isTeamLeader ? '👔 Team-Leader' : '👤 Partner'} | ${data.user.email}
                                </p>
                            </div>
                            ${isTopPerformer ? `
                                <span class="status-badge" style="background: var(--primary-gold); color: white; font-weight: bold;">
                                    <i class="fas fa-crown"></i> Top Performer
                                </span>
                            ` : ''}
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-label">Leads</div>
                                <div class="stat-value" style="font-size: 24px;">${data.leads}</div>
                            </div>
                            <div class="stat-card gold">
                                <div class="stat-label">Gespräche</div>
                                <div class="stat-value" style="font-size: 24px;">${data.calls}</div>
                            </div>
                            <div class="stat-card success">
                                <div class="stat-label">Abschlüsse</div>
                                <div class="stat-value" style="font-size: 24px;">${data.deals}</div>
                            </div>
                            <div class="stat-card warning">
                                <div class="stat-label">Umsatz</div>
                                <div class="stat-value" style="font-size: 18px;">${utils.formatCurrency(data.revenue)}</div>
                            </div>
                        </div>

                        <div style="margin-top: 15px; padding: 12px; background: var(--grey-lighter); border-radius: 8px;">
                            <strong style="color: var(--primary-blue);">Conversion Rate:</strong> 
                            <span style="font-size: 20px; font-weight: 700; color: ${data.conversion > 20 ? 'var(--success)' : data.conversion > 10 ? 'var(--warning)' : 'var(--danger)'};">
                                ${utils.formatPercentage(data.conversion)}
                            </span>
                            <span class="text-muted" style="font-size: 13px;">
                                (${data.deals} Abschlüsse / ${data.calls} Gespräche)
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    },

    addUser() {
        const teamLeaders = db.getUsers().filter(u => u.role === 'teamleader' && u.status === 'active');
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Neuer Benutzer</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm">
                        <div class="form-group">
                            <label for="userName">Name</label>
                            <input type="text" id="userName" required>
                        </div>
                        <div class="form-group">
                            <label for="userEmail">E-Mail</label>
                            <input type="email" id="userEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="userPassword">Passwort</label>
                            <input type="password" id="userPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="userPhone">Telefon</label>
                            <input type="tel" id="userPhone">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="userRole">Rolle</label>
                                <select id="userRole" required>
                                    <option value="partner">Partner</option>
                                    <option value="teamleader">Team-Leader</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="userStatus">Status</label>
                                <select id="userStatus" required>
                                    <option value="active">Aktiv</option>
                                    <option value="inactive">Inaktiv</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="userTeamLeader">Team-Leader</label>
                            <select id="userTeamLeader">
                                <option value="">Kein Team</option>
                                ${teamLeaders.map(tl => `<option value="${tl.id}">${tl.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Abbrechen
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Erstellen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('userEmail').value;
            if (db.getUserByEmail(email)) {
                utils.showToast('Diese E-Mail-Adresse ist bereits registriert', 'error');
                return;
            }

            const user = {
                id: utils.generateId(),
                name: document.getElementById('userName').value,
                email: email,
                password: document.getElementById('userPassword').value,
                phone: document.getElementById('userPhone').value,
                role: document.getElementById('userRole').value,
                status: document.getElementById('userStatus').value,
                teamLeaderId: document.getElementById('userTeamLeader').value || null,
                createdAt: Date.now()
            };

            db.addUser(user);
            utils.showToast('Benutzer erfolgreich erstellt', 'success');
            this.loadUsers();
            this.loadPerformance();
            modal.remove();
        });
    },

    editUser(id) {
        const user = db.getUserById(id);
        if (!user) return;

        const teamLeaders = db.getUsers().filter(u => u.role === 'teamleader' && u.status === 'active' && u.id !== id);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Benutzer bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <div class="form-group">
                            <label for="editUserName">Name</label>
                            <input type="text" id="editUserName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editUserEmail">E-Mail</label>
                            <input type="email" id="editUserEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="editUserPhone">Telefon</label>
                            <input type="tel" id="editUserPhone" value="${user.phone || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editUserRole">Rolle</label>
                                <select id="editUserRole" required>
                                    <option value="partner" ${user.role === 'partner' ? 'selected' : ''}>Partner</option>
                                    <option value="teamleader" ${user.role === 'teamleader' ? 'selected' : ''}>Team-Leader</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editUserStatus">Status</label>
                                <select id="editUserStatus" required>
                                    <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktiv</option>
                                    <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inaktiv</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="editUserTeamLeader">Team-Leader</label>
                            <select id="editUserTeamLeader">
                                <option value="">Kein Team</option>
                                ${teamLeaders.map(tl => `
                                    <option value="${tl.id}" ${user.teamLeaderId === tl.id ? 'selected' : ''}>
                                        ${tl.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Abbrechen
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Speichern
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('editUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                name: document.getElementById('editUserName').value,
                email: document.getElementById('editUserEmail').value,
                phone: document.getElementById('editUserPhone').value,
                role: document.getElementById('editUserRole').value,
                status: document.getElementById('editUserStatus').value,
                teamLeaderId: document.getElementById('editUserTeamLeader').value || null
            };

            db.updateUser(id, updates);
            utils.showToast('Benutzer erfolgreich aktualisiert', 'success');
            this.loadUsers();
            this.loadPerformance();
            modal.remove();
        });
    },

    toggleUserStatus(id) {
        const user = db.getUserById(id);
        if (!user) return;

        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        db.updateUser(id, { status: newStatus });
        
        utils.showToast(
            `Benutzer ${user.name} wurde ${newStatus === 'active' ? 'aktiviert' : 'deaktiviert'}`,
            newStatus === 'active' ? 'success' : 'warning'
        );
        
        this.loadUsers();
        this.loadPerformance();
    },

    deleteUser(id) {
        const user = db.getUserById(id);
        if (!user) return;

        if (utils.confirm(`Möchten Sie den Benutzer "${user.name}" wirklich löschen?\n\nAlle zugehörigen Daten (Leads, Gespräche, etc.) bleiben erhalten.`)) {
            db.deleteUser(id);
            utils.showToast('Benutzer wurde gelöscht', 'success');
            this.loadUsers();
            this.loadPerformance();
        }
    }
};
