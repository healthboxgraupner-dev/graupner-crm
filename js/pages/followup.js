// ===================================
// Follow-up Plan Page
// ===================================

const followupPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-calendar-check"></i> Follow-up-Plan</h1>
                <p>Planen und verwalten Sie Ihre Nachfass-Termine</p>
            </div>

            <div class="page-actions">
                <button class="btn btn-primary" onclick="followupPage.addFollowup()">
                    <i class="fas fa-plus"></i> Neuer Follow-up
                </button>
                <button class="btn btn-gold" onclick="exportData.exportFollowups('${authApp.currentUser.id}')">
                    <i class="fas fa-file-excel"></i> Excel Export
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Alle Follow-ups</h2>
                </div>

                <div class="table-container">
                    <table class="data-table" id="followupTable">
                        <thead>
                            <tr>
                                <th>Kontakt</th>
                                <th>Letzter Kontakt</th>
                                <th>Nächster Kontakt</th>
                                <th>Kanal</th>
                                <th>Reminder</th>
                                <th>Kommentar</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="followupTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init() {
        this.loadFollowups();
    },

    loadFollowups() {
        const followups = db.getFollowups(authApp.currentUser.id);
        const tbody = document.getElementById('followupTableBody');
        
        if (followups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <i class="fas fa-calendar-times" style="font-size: 48px; color: var(--grey-light); display: block; margin-bottom: 15px;"></i>
                        <p class="text-muted">Noch keine Follow-ups geplant. Fügen Sie Ihren ersten Follow-up hinzu!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = followups.map(followup => {
            const isOverdue = utils.isOverdue(followup.nextContact);
            const rowClass = isOverdue ? 'class="overdue"' : '';
            
            return `
                <tr data-id="${followup.id}" ${rowClass}>
                    <td>
                        <strong>${followup.contact}</strong>
                        ${isOverdue ? '<br><span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Überfällig</span>' : ''}
                    </td>
                    <td>${utils.formatDate(followup.lastContact)}</td>
                    <td>
                        ${utils.formatDate(followup.nextContact)}
                        ${isOverdue ? '<br><span class="text-danger">(' + utils.daysDifference(followup.nextContact, utils.getTodayString()) + ' Tage)</span>' : ''}
                    </td>
                    <td>
                        <span class="status-badge status-${followup.channel === 'WhatsApp' ? 'approved' : followup.channel === 'E-Mail' ? 'pending' : 'inprogress'}">
                            ${this.getChannelIcon(followup.channel)} ${followup.channel}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        ${followup.reminder ? '✅' : '❌'}
                    </td>
                    <td>${followup.comment || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon btn-success" onclick="followupPage.addToGoogleCalendar('${followup.id}')" title="Zu Google Calendar hinzufügen">
                                <i class="fab fa-google"></i>
                            </button>
                            <button class="btn-icon btn-info" onclick="followupPage.downloadICS('${followup.id}')" title=".ics Download (Apple Calendar, Outlook, etc.)">
                                <i class="fas fa-calendar-plus"></i>
                            </button>
                            <button class="btn-icon btn-primary" onclick="followupPage.editFollowup('${followup.id}')" title="Bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="followupPage.deleteFollowup('${followup.id}')" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    getChannelIcon(channel) {
        const icons = {
            'WhatsApp': '<i class="fab fa-whatsapp"></i>',
            'E-Mail': '<i class="fas fa-envelope"></i>',
            'Telefon': '<i class="fas fa-phone"></i>',
            'Zoom': '<i class="fas fa-video"></i>',
            'Persönlich': '<i class="fas fa-handshake"></i>'
        };
        return icons[channel] || '<i class="fas fa-comment"></i>';
    },

    addFollowup() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Neuer Follow-up</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="followupForm">
                        <div class="form-group">
                            <label for="followupContact">Kontakt</label>
                            <input type="text" id="followupContact" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="followupLastContact">Letzter Kontakt</label>
                                <input type="date" id="followupLastContact" value="${utils.getTodayString()}" required>
                            </div>
                            <div class="form-group">
                                <label for="followupNextContact">Nächster Kontakt</label>
                                <input type="date" id="followupNextContact" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="followupChannel">Kanal</label>
                                <select id="followupChannel" required>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Zoom">Zoom</option>
                                    <option value="Telefon">Telefon</option>
                                    <option value="E-Mail">E-Mail</option>
                                    <option value="Persönlich">Persönlich</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="followupReminder">E-Mail Reminder aktivieren</label>
                                <select id="followupReminder" required>
                                    <option value="true">✅ Ja</option>
                                    <option value="false">❌ Nein</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="followupComment">Kommentar</label>
                            <textarea id="followupComment" rows="4"></textarea>
                        </div>
                        <div class="info-text">
                            <i class="fas fa-info-circle"></i> Bei aktiviertem Reminder werden Sie automatisch per E-Mail erinnert.
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

        document.getElementById('followupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const followup = {
                id: utils.generateId(),
                userId: authApp.currentUser.id,
                contact: document.getElementById('followupContact').value,
                lastContact: document.getElementById('followupLastContact').value,
                nextContact: document.getElementById('followupNextContact').value,
                channel: document.getElementById('followupChannel').value,
                reminder: document.getElementById('followupReminder').value === 'true',
                comment: document.getElementById('followupComment').value
            };

            db.addFollowup(followup);
            
            if (followup.reminder) {
                utils.showToast('Follow-up hinzugefügt mit E-Mail Reminder aktiviert', 'success');
            } else {
                utils.showToast('Follow-up erfolgreich hinzugefügt', 'success');
            }
            
            this.loadFollowups();
            modal.remove();
        });
    },

    editFollowup(id) {
        const followup = db.getFollowups().find(f => f.id === id);
        if (!followup) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Follow-up bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editFollowupForm">
                        <div class="form-group">
                            <label for="editFollowupContact">Kontakt</label>
                            <input type="text" id="editFollowupContact" value="${followup.contact}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editFollowupLastContact">Letzter Kontakt</label>
                                <input type="date" id="editFollowupLastContact" value="${followup.lastContact}" required>
                            </div>
                            <div class="form-group">
                                <label for="editFollowupNextContact">Nächster Kontakt</label>
                                <input type="date" id="editFollowupNextContact" value="${followup.nextContact}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editFollowupChannel">Kanal</label>
                                <select id="editFollowupChannel" required>
                                    <option value="WhatsApp" ${followup.channel === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                                    <option value="Zoom" ${followup.channel === 'Zoom' ? 'selected' : ''}>Zoom</option>
                                    <option value="Telefon" ${followup.channel === 'Telefon' ? 'selected' : ''}>Telefon</option>
                                    <option value="E-Mail" ${followup.channel === 'E-Mail' ? 'selected' : ''}>E-Mail</option>
                                    <option value="Persönlich" ${followup.channel === 'Persönlich' ? 'selected' : ''}>Persönlich</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editFollowupReminder">E-Mail Reminder</label>
                                <select id="editFollowupReminder" required>
                                    <option value="true" ${followup.reminder ? 'selected' : ''}>✅ Ja</option>
                                    <option value="false" ${!followup.reminder ? 'selected' : ''}>❌ Nein</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="editFollowupComment">Kommentar</label>
                            <textarea id="editFollowupComment" rows="4">${followup.comment || ''}</textarea>
                        </div>
                        
                        <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--grey-dark);">
                                <i class="fas fa-calendar-plus"></i> Zu Kalender hinzufügen
                            </h4>
                            <div style="display: flex; gap: 10px;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="followupPage.addToGoogleCalendar('${id}')" style="flex: 1;">
                                    <i class="fab fa-google"></i> Google Calendar
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="followupPage.downloadICS('${id}')" style="flex: 1;">
                                    <i class="fas fa-download"></i> .ics Download
                                </button>
                            </div>
                            <small class="text-muted" style="display: block; margin-top: 8px; font-size: 12px;">
                                <i class="fas fa-info-circle"></i> .ics funktioniert mit Apple Calendar, Outlook und allen anderen Kalendern
                            </small>
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

        document.getElementById('editFollowupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                contact: document.getElementById('editFollowupContact').value,
                lastContact: document.getElementById('editFollowupLastContact').value,
                nextContact: document.getElementById('editFollowupNextContact').value,
                channel: document.getElementById('editFollowupChannel').value,
                reminder: document.getElementById('editFollowupReminder').value === 'true',
                comment: document.getElementById('editFollowupComment').value
            };

            db.updateFollowup(id, updates);
            utils.showToast('Follow-up erfolgreich aktualisiert', 'success');
            this.loadFollowups();
            modal.remove();
        });
    },

    deleteFollowup(id) {
        if (utils.confirm('Möchten Sie diesen Follow-up wirklich löschen?')) {
            db.deleteFollowup(id);
            utils.showToast('Follow-up wurde gelöscht', 'success');
            this.loadFollowups();
        }
    },

    // Calendar Export Methods
    addToGoogleCalendar(id) {
        const followups = db.getFollowups();
        const followup = followups.find(f => f.id === id);
        if (!followup) {
            utils.showToast('Follow-up nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.followupToEvent(followup);
        calendarExport.openGoogleCalendar(event);
    },

    downloadICS(id) {
        const followups = db.getFollowups();
        const followup = followups.find(f => f.id === id);
        if (!followup) {
            utils.showToast('Follow-up nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.followupToEvent(followup);
        const filename = `followup_${followup.contact.toLowerCase().replace(/\s+/g, '_')}`;
        calendarExport.downloadICS(event, filename);
    }
};
