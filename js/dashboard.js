// ===================================
// Dashboard Module
// ===================================

const dashboardModule = {
    render(container) {
        const user = authApp.currentUser;
        const leads = this.getLeadsForUser(user);
        const stats = this.calculateStats(leads);
        const messages = this.getMessagesForUser(user);
        
        let html = `
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon blue">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.totalLeads}</div>
                    <div class="stat-label">Gesamt Leads</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon gold">
                            <i class="fas fa-phone"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.contacted}</div>
                    <div class="stat-label">Gespräche</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon green">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.closed}</div>
                    <div class="stat-label">Abschlüsse</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon cyan">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value">${formatCurrency(stats.revenue)}</div>
                    <div class="stat-label">Umsatz</div>
                </div>
            </div>

            <!-- Mitteilungen -->
            ${this.renderMessages(messages)}
        `;
        
        // Team Overview für Teamleader und Admin
        if (user.role === 'teamleader' || user.role === 'admin') {
            html += this.renderTeamOverview(user);
        }
        
        container.innerHTML = html;
    },

    getLeadsForUser(user) {
        const allLeads = DB.get('leads');
        
        if (user.role === 'admin') {
            return allLeads;
        } else if (user.role === 'teamleader') {
            const teamMembers = DB.find('users', { teamleader: user.id });
            const teamIds = [user.id, ...teamMembers.map(m => m.id)];
            return allLeads.filter(l => teamIds.includes(l.assignedTo));
        } else {
            return allLeads.filter(l => l.assignedTo === user.id);
        }
    },

    calculateStats(leads) {
        return {
            totalLeads: leads.length,
            contacted: leads.filter(l => ['kontaktiert', 'qualifiziert', 'abgeschlossen'].includes(l.status)).length,
            closed: leads.filter(l => l.status === 'abgeschlossen').length,
            revenue: leads.filter(l => l.status === 'abgeschlossen').reduce((sum, l) => sum + l.amount, 0)
        };
    },

    getMessagesForUser(user) {
        const allMessages = DB.get('messages');
        return allMessages.filter(m => 
            !m.read && (m.userId === user.id || m.userId === 'all')
        ).slice(0, 4);
    },

    renderMessages(messages) {
        if (messages.length === 0) {
            return `
                <div class="messages-box">
                    <h2>📬 Ungelesene Mitteilungen</h2>
                    <p style="color: var(--gray-500);">Keine neuen Mitteilungen</p>
                </div>
            `;
        }

        return `
            <div class="messages-box">
                <h2>📬 Ungelesene Mitteilungen (${messages.length})</h2>
                ${messages.map(msg => `
                    <div class="message-item">
                        <div class="message-icon ${msg.type}">
                            <i class="fas fa-${this.getMessageIcon(msg.type)}"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-text"><strong>${msg.title}</strong><br>${msg.text}</div>
                            <div class="message-time">${getRelativeTime(msg.timestamp)}</div>
                        </div>
                        <button class="message-action" onclick="dashboardModule.markAsRead('${msg.id}')">
                            Gelesen
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getMessageIcon(type) {
        const icons = { info: 'info-circle', warning: 'exclamation-triangle', success: 'check-circle' };
        return icons[type] || 'bell';
    },

    markAsRead(messageId) {
        DB.update('messages', messageId, { read: true });
        showToast('success', 'Mitteilung als gelesen markiert');
        app.navigateTo('dashboard');
    },

    renderTeamOverview(user) {
        const teamMembers = user.role === 'admin' 
            ? DB.get('users').filter(u => u.role !== 'admin')
            : DB.find('users', { teamleader: user.id });

        if (teamMembers.length === 0) {
            return '<div class="card"><h2>👥 Mein Team</h2><p>Keine Team-Mitglieder</p></div>';
        }

        const teamStats = teamMembers.map(member => {
            const leads = DB.find('leads', { assignedTo: member.id });
            return {
                ...member,
                leadsCount: leads.length,
                contactedCount: leads.filter(l => ['kontaktiert', 'qualifiziert', 'abgeschlossen'].includes(l.status)).length,
                closedCount: leads.filter(l => l.status === 'abgeschlossen').length,
                revenue: leads.filter(l => l.status === 'abgeschlossen').reduce((sum, l) => sum + l.amount, 0)
            };
        });

        return `
            <div class="team-overview">
                <h2>👥 Mein Team - Übersicht</h2>
                <table class="team-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Leads</th>
                            <th>Gespräche</th>
                            <th>Abschlüsse</th>
                            <th>Umsatz</th>
                            <th>Status</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teamStats.map(member => `
                            <tr>
                                <td>
                                    <div class="team-member">
                                        <div class="team-avatar">${member.name.charAt(0)}</div>
                                        <span>${member.name}</span>
                                    </div>
                                </td>
                                <td>${member.leadsCount}</td>
                                <td>${member.contactedCount}</td>
                                <td>${member.closedCount}</td>
                                <td>${formatCurrency(member.revenue)}</td>
                                <td><span class="badge ${member.status}">${member.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span></td>
                                <td><button class="btn-details" onclick="dashboardModule.showMemberDetails('${member.id}')">Details</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showMemberDetails(userId) {
        const member = DB.findById('users', userId);
        const leads = DB.find('leads', { assignedTo: userId });
        
        alert(`Details für ${member.name}:\n\n` +
              `Gesamt Leads: ${leads.length}\n` +
              `Abgeschlossen: ${leads.filter(l => l.status === 'abgeschlossen').length}\n` +
              `Umsatz: ${formatCurrency(leads.filter(l => l.status === 'abgeschlossen').reduce((sum, l) => sum + l.amount, 0))}`);
    }
};
