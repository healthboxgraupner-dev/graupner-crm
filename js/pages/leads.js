// ===================================
// Leads Page
// ===================================

const leadsPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-users"></i> Lead-Übersicht</h1>
                <p>Verwalten Sie Ihre Kontakte und potentiellen Kunden</p>
            </div>

            <div class="page-actions">
                <button class="btn btn-primary" onclick="leadsPage.addLead()">
                    <i class="fas fa-plus"></i> Neuer Lead
                </button>
                <button class="btn btn-gold" onclick="exportData.exportLeads('${authApp.currentUser.id}')">
                    <i class="fas fa-file-excel"></i> Excel Export
                </button>
                <button class="btn btn-secondary" onclick="exportData.exportLeadsToPDF('${authApp.currentUser.id}')">
                    <i class="fas fa-file-pdf"></i> PDF Export
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Alle Leads</h2>
                    <div>
                        <input type="text" id="leadSearch" placeholder="Suchen..." style="padding: 8px 12px; border: 1px solid var(--grey-light); border-radius: 6px;">
                    </div>
                </div>
                
                <div class="info-text" style="margin-bottom: 20px;">
                    <i class="fas fa-info-circle"></i> <strong>Empfehlung:</strong> Jeden Tag 3–5 neue Leads hinzufügen. Jede Woche die Spalte "Nächster Schritt" aktualisieren.
                </div>

                <div class="table-container">
                    <table class="data-table" id="leadsTable">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Kontakt</th>
                                <th>Quelle</th>
                                <th>Status</th>
                                <th>Nächster Schritt</th>
                                <th>Follow-up</th>
                                <th>Notizen</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="leadsTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init() {
        this.loadLeads();
        
        // Search functionality
        document.getElementById('leadSearch').addEventListener('input', (e) => {
            this.filterLeads(e.target.value);
        });
    },

    loadLeads() {
        const leads = db.getLeads(authApp.currentUser.id);
        const tbody = document.getElementById('leadsTableBody');
        
        if (leads.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: var(--grey-light); display: block; margin-bottom: 15px;"></i>
                        <p class="text-muted">Noch keine Leads vorhanden. Fügen Sie Ihren ersten Lead hinzu!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = leads.map(lead => `
            <tr data-id="${lead.id}">
                <td>${utils.formatDate(lead.date)}</td>
                <td><strong>${lead.contactName}</strong></td>
                <td>${lead.source}</td>
                <td>
                    <span class="status-badge status-${lead.status}">
                        ${utils.getStatusEmoji(lead.status)} ${utils.getStatusLabel(lead.status)}
                    </span>
                </td>
                <td>${lead.nextStep}</td>
                <td>${utils.formatDate(lead.followupDate)}</td>
                <td>${lead.notes ? lead.notes.substring(0, 50) + (lead.notes.length > 50 ? '...' : '') : '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-primary" onclick="leadsPage.editLead('${lead.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="leadsPage.deleteLead('${lead.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    filterLeads(searchTerm) {
        const rows = document.querySelectorAll('#leadsTableBody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    },

    addLead() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Neuer Lead</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="leadForm">
                        <div class="form-group">
                            <label for="leadDate">Datum</label>
                            <input type="date" id="leadDate" value="${utils.getTodayString()}" required>
                        </div>
                        <div class="form-group">
                            <label for="leadContact">Name des Kontakts</label>
                            <input type="text" id="leadContact" required>
                        </div>
                        <div class="form-group">
                            <label for="leadSource">Quelle</label>
                            <select id="leadSource" required>
                                <option value="Empfehlung">Empfehlung</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Zoom Event">Zoom Event</option>
                                <option value="Kaltakquise">Kaltakquise</option>
                                <option value="Website">Website</option>
                                <option value="Event">Event</option>
                                <option value="Sonstiges">Sonstiges</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="leadStatus">Status</label>
                            <select id="leadStatus" required>
                                <option value="neu">🟢 Neu</option>
                                <option value="in_gespraech">🟠 In Gespräch</option>
                                <option value="angebot">🔵 Angebot</option>
                                <option value="abgeschlossen">🔴 Abgeschlossen</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="leadNextStep">Nächster Schritt</label>
                            <input type="text" id="leadNextStep" required>
                        </div>
                        <div class="form-group">
                            <label for="leadFollowup">Follow-up Termin</label>
                            <input type="date" id="leadFollowup" required>
                        </div>
                        <div class="form-group">
                            <label for="leadNotes">Notizen</label>
                            <textarea id="leadNotes" rows="4"></textarea>
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

        document.getElementById('leadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const lead = {
                id: utils.generateId(),
                userId: authApp.currentUser.id,
                date: document.getElementById('leadDate').value,
                contactName: document.getElementById('leadContact').value,
                source: document.getElementById('leadSource').value,
                status: document.getElementById('leadStatus').value,
                nextStep: document.getElementById('leadNextStep').value,
                followupDate: document.getElementById('leadFollowup').value,
                notes: document.getElementById('leadNotes').value
            };

            db.addLead(lead);
            utils.showToast('Lead erfolgreich hinzugefügt', 'success');
            this.loadLeads();
            modal.remove();
        });
    },

    editLead(id) {
        const lead = db.getLeads().find(l => l.id === id);
        if (!lead) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Lead bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editLeadForm">
                        <div class="form-group">
                            <label for="editLeadDate">Datum</label>
                            <input type="date" id="editLeadDate" value="${lead.date}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLeadContact">Name des Kontakts</label>
                            <input type="text" id="editLeadContact" value="${lead.contactName}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLeadSource">Quelle</label>
                            <select id="editLeadSource" required>
                                <option value="Empfehlung" ${lead.source === 'Empfehlung' ? 'selected' : ''}>Empfehlung</option>
                                <option value="Social Media" ${lead.source === 'Social Media' ? 'selected' : ''}>Social Media</option>
                                <option value="Zoom Event" ${lead.source === 'Zoom Event' ? 'selected' : ''}>Zoom Event</option>
                                <option value="Kaltakquise" ${lead.source === 'Kaltakquise' ? 'selected' : ''}>Kaltakquise</option>
                                <option value="Website" ${lead.source === 'Website' ? 'selected' : ''}>Website</option>
                                <option value="Event" ${lead.source === 'Event' ? 'selected' : ''}>Event</option>
                                <option value="Sonstiges" ${lead.source === 'Sonstiges' ? 'selected' : ''}>Sonstiges</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editLeadStatus">Status</label>
                            <select id="editLeadStatus" required>
                                <option value="neu" ${lead.status === 'neu' ? 'selected' : ''}>🟢 Neu</option>
                                <option value="in_gespraech" ${lead.status === 'in_gespraech' ? 'selected' : ''}>🟠 In Gespräch</option>
                                <option value="angebot" ${lead.status === 'angebot' ? 'selected' : ''}>🔵 Angebot</option>
                                <option value="abgeschlossen" ${lead.status === 'abgeschlossen' ? 'selected' : ''}>🔴 Abgeschlossen</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editLeadNextStep">Nächster Schritt</label>
                            <input type="text" id="editLeadNextStep" value="${lead.nextStep}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLeadFollowup">Follow-up Termin</label>
                            <input type="date" id="editLeadFollowup" value="${lead.followupDate}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLeadNotes">Notizen</label>
                            <textarea id="editLeadNotes" rows="4">${lead.notes || ''}</textarea>
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

        document.getElementById('editLeadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                date: document.getElementById('editLeadDate').value,
                contactName: document.getElementById('editLeadContact').value,
                source: document.getElementById('editLeadSource').value,
                status: document.getElementById('editLeadStatus').value,
                nextStep: document.getElementById('editLeadNextStep').value,
                followupDate: document.getElementById('editLeadFollowup').value,
                notes: document.getElementById('editLeadNotes').value
            };

            db.updateLead(id, updates);
            utils.showToast('Lead erfolgreich aktualisiert', 'success');
            this.loadLeads();
            modal.remove();
        });
    },

    deleteLead(id) {
        if (utils.confirm('Möchten Sie diesen Lead wirklich löschen?')) {
            db.deleteLead(id);
            utils.showToast('Lead wurde gelöscht', 'success');
            this.loadLeads();
        }
    }
};
