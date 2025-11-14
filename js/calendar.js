// Calendar Module
const calendarModule = {
    render(container) {
        const events = DB.get('calendar').filter(e => 
            authApp.currentUser.role === 'admin' || e.assignedTo === authApp.currentUser.id
        );

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Kalender & Termine</h2>
                    <button class="btn btn-primary" onclick="calendarModule.showAddForm()">
                        <i class="fas fa-plus"></i> Neuer Termin
                    </button>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Titel</th>
                            <th>Datum</th>
                            <th>Dauer</th>
                            <th>Ort</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.sort((a, b) => a.date - b.date).map(e => `
                            <tr>
                                <td><strong>${e.title}</strong><br><small>${e.description}</small></td>
                                <td>${formatDateTime(e.date)}</td>
                                <td>${e.duration} Min</td>
                                <td>${e.location || '-'}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="generateICS(${JSON.stringify(e).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-download"></i> .ics
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
                    <h2>Neuer Termin</h2>
                    <form onsubmit="calendarModule.save(event)">
                        <div class="form-group">
                            <label>Titel *</label>
                            <input type="text" id="calTitle" required>
                        </div>
                        <div class="form-group">
                            <label>Datum & Uhrzeit *</label>
                            <input type="datetime-local" id="calDate" required>
                        </div>
                        <div class="form-group">
                            <label>Dauer (Minuten)</label>
                            <input type="number" id="calDuration" value="60" min="15" step="15">
                        </div>
                        <div class="form-group">
                            <label>Ort</label>
                            <input type="text" id="calLocation" placeholder="z.B. München, Online">
                        </div>
                        <div class="form-group">
                            <label>Beschreibung</label>
                            <textarea id="calDesc" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-success">Termin speichern</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    save(e) {
        e.preventDefault();
        const event = {
            id: generateId('cal'),
            title: document.getElementById('calTitle').value,
            date: new Date(document.getElementById('calDate').value).getTime(),
            duration: parseInt(document.getElementById('calDuration').value),
            location: document.getElementById('calLocation').value,
            description: document.getElementById('calDesc').value,
            assignedTo: authApp.currentUser.id,
            created: Date.now()
        };
        
        DB.add('calendar', event);
        showToast('success', 'Termin erstellt');
        authApp.logActivity('calendar_created', `Termin erstellt: ${event.title}`);
        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('calendar');
    }
};
