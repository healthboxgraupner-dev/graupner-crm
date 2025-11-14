// Follow-up Module
const followupModule = {
    render(container) {
        const user = authApp.currentUser;
        const followups = DB.get('followups').filter(f => 
            user.role === 'admin' || f.assignedTo === user.id
        );

        const overdue = followups.filter(f => f.dueDate < Date.now() && f.status === 'ausstehend');
        const today = followups.filter(f => {
            const due = new Date(f.dueDate);
            const now = new Date();
            return due.toDateString() === now.toDateString() && f.status === 'ausstehend';
        });
        const upcoming = followups.filter(f => f.dueDate > Date.now() && f.status === 'ausstehend');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Follow-up System</h2>
                    <button class="btn btn-primary" onclick="followupModule.showAddForm()">
                        <i class="fas fa-plus"></i> Neues Follow-up
                    </button>
                </div>

                ${overdue.length > 0 ? `
                    <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--danger-red); 
                                padding: 16px; margin: 20px 0; border-radius: 8px;">
                        <strong style="color: var(--danger-red);">
                            <i class="fas fa-exclamation-triangle"></i> ${overdue.length} überfällige Follow-ups!
                        </strong>
                    </div>
                ` : ''}

                <h3 style="color: var(--danger-red); margin-top: 20px;">⚠️ Überfällig (${overdue.length})</h3>
                ${this.renderFollowupTable(overdue, 'danger')}

                <h3 style="color: var(--warning-orange); margin-top: 30px;">📅 Heute fällig (${today.length})</h3>
                ${this.renderFollowupTable(today, 'warning')}

                <h3 style="color: var(--success-green); margin-top: 30px;">📆 Kommend (${upcoming.length})</h3>
                ${this.renderFollowupTable(upcoming, 'success')}
            </div>
        `;
    },

    renderFollowupTable(followups, color) {
        if (followups.length === 0) {
            return '<p style="color: var(--gray-500);">Keine Follow-ups</p>';
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Lead</th>
                        <th>Typ</th>
                        <th>Fällig am</th>
                        <th>Priorität</th>
                        <th>Notizen</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${followups.map(f => `
                        <tr style="border-left: 4px solid var(--${color}-${color === 'success' ? 'green' : color === 'warning' ? 'orange' : 'red'});">
                            <td><strong>${f.leadName}</strong></td>
                            <td><i class="fas fa-${f.type === 'Anruf' ? 'phone' : f.type === 'E-Mail' ? 'envelope' : 'handshake'}"></i> ${f.type}</td>
                            <td>${formatDateTime(f.dueDate)}</td>
                            <td><span class="badge ${f.priority}">${f.priority}</span></td>
                            <td>${f.notes}</td>
                            <td>
                                <button class="btn btn-success" onclick="followupModule.complete('${f.id}')">
                                    <i class="fas fa-check"></i> Erledigt
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    showAddForm() {
        const leads = DB.get('leads').filter(l => l.status !== 'abgeschlossen');
        document.body.insertAdjacentHTML('beforeend', `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;"
                     onclick="event.stopPropagation()">
                    <h2>Neues Follow-up</h2>
                    <form onsubmit="followupModule.save(event)">
                        <div class="form-group">
                            <label>Lead auswählen *</label>
                            <select id="fuLead" required>
                                ${leads.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Typ *</label>
                            <select id="fuType" required>
                                <option value="Anruf">Anruf</option>
                                <option value="E-Mail">E-Mail</option>
                                <option value="Meeting">Meeting</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fällig am *</label>
                            <input type="datetime-local" id="fuDate" required>
                        </div>
                        <div class="form-group">
                            <label>Priorität</label>
                            <select id="fuPriority">
                                <option value="niedrig">Niedrig</option>
                                <option value="mittel" selected>Mittel</option>
                                <option value="hoch">Hoch</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notizen</label>
                            <textarea id="fuNotes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-success">Speichern</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    save(e) {
        e.preventDefault();
        const leadId = document.getElementById('fuLead').value;
        const lead = DB.findById('leads', leadId);
        
        const followup = {
            id: generateId('fu'),
            leadId: leadId,
            leadName: lead.name,
            type: document.getElementById('fuType').value,
            dueDate: new Date(document.getElementById('fuDate').value).getTime(),
            priority: document.getElementById('fuPriority').value,
            notes: document.getElementById('fuNotes').value,
            status: 'ausstehend',
            assignedTo: authApp.currentUser.id,
            created: Date.now()
        };
        
        DB.add('followups', followup);
        showToast('success', 'Follow-up erstellt');
        authApp.logActivity('followup_created', `Follow-up erstellt für ${lead.name}`);
        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('followup');
    },

    complete(id) {
        DB.update('followups', id, { status: 'erledigt' });
        showToast('success', 'Follow-up als erledigt markiert');
        authApp.logActivity('followup_completed', 'Follow-up abgeschlossen');
        app.navigateTo('followup');
    }
};
