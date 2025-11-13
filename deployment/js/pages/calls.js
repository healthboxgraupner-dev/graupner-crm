// ===================================
// Calls/Conversations Tracking Page
// ===================================

const callsPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-phone"></i> Gesprächs-Tracking</h1>
                <p>Dokumentieren Sie Ihre 1:1 Gespräche und Ergebnisse</p>
            </div>

            <div class="page-actions">
                <button class="btn btn-primary" onclick="callsPage.addCall()">
                    <i class="fas fa-plus"></i> Neues Gespräch
                </button>
                <button class="btn btn-gold" onclick="exportData.exportCalls('${authApp.currentUser.id}')">
                    <i class="fas fa-file-excel"></i> Excel Export
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Alle Gespräche</h2>
                </div>

                <div class="table-container">
                    <table class="data-table" id="callsTable">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Gesprächspartner</th>
                                <th>Dauer</th>
                                <th>Thema / Box</th>
                                <th>Ergebnis</th>
                                <th>Nächste Aktion</th>
                                <th>Bemerkung</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="callsTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init() {
        this.loadCalls();
    },

    loadCalls() {
        const calls = db.getCalls(authApp.currentUser.id);
        const tbody = document.getElementById('callsTableBody');
        
        if (calls.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-phone-slash" style="font-size: 48px; color: var(--grey-light); display: block; margin-bottom: 15px;"></i>
                        <p class="text-muted">Noch keine Gespräche dokumentiert. Fügen Sie Ihr erstes Gespräch hinzu!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = calls.map(call => `
            <tr data-id="${call.id}">
                <td>${utils.formatDate(call.date)}</td>
                <td><strong>${call.partner}</strong></td>
                <td>${call.duration}</td>
                <td>${call.topic}</td>
                <td>
                    <span class="status-badge ${this.getResultClass(call.result)}">
                        ${call.result}
                    </span>
                </td>
                <td>${call.nextAction}</td>
                <td>${call.notes ? call.notes.substring(0, 40) + (call.notes.length > 40 ? '...' : '') : '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-success" onclick="callsPage.addToGoogleCalendar('${call.id}')" title="Zu Google Calendar hinzufügen">
                            <i class="fab fa-google"></i>
                        </button>
                        <button class="btn-icon btn-info" onclick="callsPage.downloadICS('${call.id}')" title=".ics Download (Apple Calendar, Outlook, etc.)">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button class="btn-icon btn-primary" onclick="callsPage.editCall('${call.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="callsPage.deleteCall('${call.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getResultClass(result) {
        const map = {
            'Positiv': 'status-approved',
            'Neutral': 'status-pending',
            'Nachfassen': 'status-inprogress',
            'Absage': 'status-inactive'
        };
        return map[result] || 'status-pending';
    },

    addCall() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Neues Gespräch</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="callForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="callDate">Datum</label>
                                <input type="date" id="callDate" value="${utils.getTodayString()}" required>
                            </div>
                            <div class="form-group">
                                <label for="callDuration">Dauer</label>
                                <input type="text" id="callDuration" placeholder="z.B. 45 Min" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="callPartner">Gesprächspartner</label>
                            <input type="text" id="callPartner" required>
                        </div>
                        <div class="form-group">
                            <label for="callTopic">Thema / Box</label>
                            <input type="text" id="callTopic" placeholder="z.B. HealthBox Elite Beratung" required>
                        </div>
                        <div class="form-group">
                            <label for="callResult">Ergebnis</label>
                            <select id="callResult" required>
                                <option value="Positiv">Positiv</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Nachfassen">Nachfassen</option>
                                <option value="Absage">Absage</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="callNextAction">Nächste Aktion</label>
                            <input type="text" id="callNextAction" required>
                        </div>
                        <div class="form-group">
                            <label for="callNotes">Bemerkung</label>
                            <textarea id="callNotes" rows="4"></textarea>
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

        document.getElementById('callForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const call = {
                id: utils.generateId(),
                userId: authApp.currentUser.id,
                date: document.getElementById('callDate').value,
                partner: document.getElementById('callPartner').value,
                duration: document.getElementById('callDuration').value,
                topic: document.getElementById('callTopic').value,
                result: document.getElementById('callResult').value,
                nextAction: document.getElementById('callNextAction').value,
                notes: document.getElementById('callNotes').value
            };

            db.addCall(call);
            utils.showToast('Gespräch erfolgreich hinzugefügt', 'success');
            this.loadCalls();
            modal.remove();
        });
    },

    editCall(id) {
        const call = db.getCalls().find(c => c.id === id);
        if (!call) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Gespräch bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editCallForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editCallDate">Datum</label>
                                <input type="date" id="editCallDate" value="${call.date}" required>
                            </div>
                            <div class="form-group">
                                <label for="editCallDuration">Dauer</label>
                                <input type="text" id="editCallDuration" value="${call.duration}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="editCallPartner">Gesprächspartner</label>
                            <input type="text" id="editCallPartner" value="${call.partner}" required>
                        </div>
                        <div class="form-group">
                            <label for="editCallTopic">Thema / Box</label>
                            <input type="text" id="editCallTopic" value="${call.topic}" required>
                        </div>
                        <div class="form-group">
                            <label for="editCallResult">Ergebnis</label>
                            <select id="editCallResult" required>
                                <option value="Positiv" ${call.result === 'Positiv' ? 'selected' : ''}>Positiv</option>
                                <option value="Neutral" ${call.result === 'Neutral' ? 'selected' : ''}>Neutral</option>
                                <option value="Nachfassen" ${call.result === 'Nachfassen' ? 'selected' : ''}>Nachfassen</option>
                                <option value="Absage" ${call.result === 'Absage' ? 'selected' : ''}>Absage</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editCallNextAction">Nächste Aktion</label>
                            <input type="text" id="editCallNextAction" value="${call.nextAction}" required>
                        </div>
                        <div class="form-group">
                            <label for="editCallNotes">Bemerkung</label>
                            <textarea id="editCallNotes" rows="4">${call.notes || ''}</textarea>
                        </div>
                        
                        <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--grey-dark);">
                                <i class="fas fa-calendar-plus"></i> Zu Kalender hinzufügen
                            </h4>
                            <div style="display: flex; gap: 10px;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="callsPage.addToGoogleCalendar('${id}')" style="flex: 1;">
                                    <i class="fab fa-google"></i> Google Calendar
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="callsPage.downloadICS('${id}')" style="flex: 1;">
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

        document.getElementById('editCallForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                date: document.getElementById('editCallDate').value,
                partner: document.getElementById('editCallPartner').value,
                duration: document.getElementById('editCallDuration').value,
                topic: document.getElementById('editCallTopic').value,
                result: document.getElementById('editCallResult').value,
                nextAction: document.getElementById('editCallNextAction').value,
                notes: document.getElementById('editCallNotes').value
            };

            db.updateCall(id, updates);
            utils.showToast('Gespräch erfolgreich aktualisiert', 'success');
            this.loadCalls();
            modal.remove();
        });
    },

    deleteCall(id) {
        if (utils.confirm('Möchten Sie dieses Gespräch wirklich löschen?')) {
            db.deleteCall(id);
            utils.showToast('Gespräch wurde gelöscht', 'success');
            this.loadCalls();
        }
    },

    // Calendar Export Methods
    addToGoogleCalendar(id) {
        const calls = db.getCalls();
        const call = calls.find(c => c.id === id);
        if (!call) {
            utils.showToast('Gespräch nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.callToEvent(call);
        calendarExport.openGoogleCalendar(event);
    },

    downloadICS(id) {
        const calls = db.getCalls();
        const call = calls.find(c => c.id === id);
        if (!call) {
            utils.showToast('Gespräch nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.callToEvent(call);
        const filename = `call_${call.partner.toLowerCase().replace(/\s+/g, '_')}`;
        calendarExport.downloadICS(event, filename);
    }
};
