// Leads Module
const leadsModule = {
    render(container) {
        const user = authApp.currentUser;
        const allLeads = DB.get('leads');
        const leads = user.role === 'admin' ? allLeads : 
                      user.role === 'teamleader' ? allLeads.filter(l => {
                          const assignedUser = DB.findById('users', l.assignedTo);
                          return assignedUser?.teamleader === user.id || l.assignedTo === user.id;
                      }) : allLeads.filter(l => l.assignedTo === user.id);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Lead-Management</h2>
                    <button class="btn btn-primary" onclick="leadsModule.showAddForm()">
                        <i class="fas fa-plus"></i> Neuer Lead
                    </button>
                </div>

                <div style="margin: 20px 0;">
                    <input type="text" id="leadSearch" placeholder="Leads durchsuchen..." 
                           style="width: 100%; padding: 12px; border: 1px solid var(--gray-300); border-radius: 8px;"
                           oninput="leadsModule.search()">
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Produkt</th>
                            <th>Betrag</th>
                            <th>Status</th>
                            <th>Priorität</th>
                            <th>Erstellt</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leads.map(lead => `
                            <tr>
                                <td><strong>${lead.name}</strong><br><small>${lead.email}</small></td>
                                <td>${lead.product}</td>
                                <td>${formatCurrency(lead.amount)}</td>
                                <td><span class="badge ${lead.status}">${lead.status}</span></td>
                                <td><span class="badge ${lead.priority}">${lead.priority}</span></td>
                                <td>${formatDate(lead.created)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="leadsModule.edit('${lead.id}')">
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
        const users = DB.get('users').filter(u => u.role === 'partner');
        const form = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;"
                     onclick="event.stopPropagation()">
                    <h2>Neuer Lead</h2>
                    <form onsubmit="leadsModule.save(event)">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="leadName" required>
                        </div>
                        <div class="form-group">
                            <label>E-Mail *</label>
                            <input type="email" id="leadEmail" required>
                        </div>
                        <div class="form-group">
                            <label>Telefon</label>
                            <input type="tel" id="leadPhone">
                        </div>
                        <div class="form-group">
                            <label>Investitionssumme (€) *</label>
                            <input type="number" id="leadAmount" required min="10000">
                        </div>
                        <div class="form-group">
                            <label>Produkt *</label>
                            <select id="leadProduct" required>
                                <option value="HealthBox Secure">HealthBox Secure</option>
                                <option value="HealthBox Core">HealthBox Core</option>
                                <option value="HealthBox Elite">HealthBox Elite</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Zuweisen an</label>
                            <select id="leadAssigned">
                                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notizen</label>
                            <textarea id="leadNotes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-success">Lead speichern</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', form);
    },

    save(e) {
        e.preventDefault();
        const lead = {
            id: generateId('lead'),
            name: document.getElementById('leadName').value,
            email: document.getElementById('leadEmail').value,
            phone: document.getElementById('leadPhone').value,
            amount: parseFloat(document.getElementById('leadAmount').value),
            product: document.getElementById('leadProduct').value,
            assignedTo: document.getElementById('leadAssigned').value,
            notes: document.getElementById('leadNotes').value,
            status: 'neu',
            priority: 'mittel',
            source: 'Manuell',
            created: Date.now()
        };
        DB.add('leads', lead);
        showToast('success', 'Lead erfolgreich erstellt');
        authApp.logActivity('lead_created', `Neuer Lead erstellt: ${lead.name}`);
        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('leads');
    },

    edit(id) {
        const lead = DB.findById('leads', id);
        alert(`Lead-Details:\n\nName: ${lead.name}\nE-Mail: ${lead.email}\nBetrag: ${formatCurrency(lead.amount)}\nStatus: ${lead.status}`);
    },

    search() {
        // Implementation für die Suche
        app.navigateTo('leads');
    }
};
