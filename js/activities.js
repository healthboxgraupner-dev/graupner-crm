// Activities Module
const activitiesModule = {
    render(container) {
        const activities = DB.get('activities').sort((a, b) => b.timestamp - a.timestamp);

        container.innerHTML = `
            <div class="card">
                <h2>Aktivitäten-Feed</h2>
                <p style="color: var(--gray-600); margin-bottom: 20px;">
                    Chronologische Übersicht aller Aktivitäten im System
                </p>

                <div style="max-height: 600px; overflow-y: auto;">
                    ${activities.map(act => `
                        <div style="padding: 16px; border-left: 3px solid ${this.getTypeColor(act.type)}; 
                                    background: var(--gray-50); margin-bottom: 12px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <i class="fas fa-${this.getTypeIcon(act.type)}" 
                                       style="color: ${this.getTypeColor(act.type)}; margin-right: 8px;"></i>
                                    <strong>${act.user}</strong>
                                    <p style="margin: 8px 0 0 24px; color: var(--gray-700);">${act.description}</p>
                                </div>
                                <span style="color: var(--gray-500); font-size: 13px; white-space: nowrap;">
                                    ${getRelativeTime(act.timestamp)}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getTypeIcon(type) {
        const icons = {
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt',
            'lead_created': 'user-plus',
            'lead_status': 'exchange-alt',
            'lead_closed': 'check-circle',
            'followup_created': 'tasks',
            'followup_completed': 'check',
            'calendar_created': 'calendar-plus',
            'calculator': 'calculator',
            'download': 'download'
        };
        return icons[type] || 'info-circle';
    },

    getTypeColor(type) {
        const colors = {
            'login': 'var(--success-green)',
            'logout': 'var(--gray-500)',
            'lead_created': 'var(--primary-blue)',
            'lead_closed': 'var(--success-green)',
            'followup_created': 'var(--warning-orange)',
            'calculator': 'var(--primary-gold)'
        };
        return colors[type] || 'var(--gray-600)';
    }
};
