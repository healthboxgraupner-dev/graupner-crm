// ===================================
// Weekly Reflection Page
// ===================================

const reflectionPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-lightbulb"></i> Wöchentliche Reflexion</h1>
                <p>Reflektieren Sie Ihre Performance und setzen Sie Ziele</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Neue Wochenreflexion</h2>
                </div>

                <form id="reflectionForm">
                    <div class="form-group">
                        <label for="reflWeek">Kalenderwoche</label>
                        <input type="text" id="reflWeek" value="${utils.getWeekNumber()}" required>
                        <small class="text-muted">Format: KW XX/YYYY</small>
                    </div>

                    <h3 style="margin: 25px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        📊 KPIs der Woche
                    </h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="reflNewLeads">Neue Leads</label>
                            <input type="number" id="reflNewLeads" min="0" value="0" required>
                        </div>
                        <div class="form-group">
                            <label for="reflCalls">Geführte Gespräche</label>
                            <input type="number" id="reflCalls" min="0" value="0" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="reflFollowups">Geplante Follow-ups</label>
                            <input type="number" id="reflFollowups" min="0" value="0" required>
                        </div>
                        <div class="form-group">
                            <label for="reflClosedDeals">Abgeschlossene Kunden</label>
                            <input type="number" id="reflClosedDeals" min="0" value="0" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="reflRevenue">Umsatz der Woche (€)</label>
                        <input type="number" id="reflRevenue" min="0" step="0.01" value="0" required>
                    </div>

                    <h3 style="margin: 25px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        💭 Reflexionsfragen
                    </h3>

                    <div class="form-group">
                        <label for="reflWentWell">
                            <i class="fas fa-smile" style="color: var(--success);"></i> Was lief gut?
                        </label>
                        <textarea id="reflWentWell" rows="4" placeholder="Erfolge, positive Erlebnisse, gute Gespräche..." required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="reflCanImprove">
                            <i class="fas fa-chart-line" style="color: var(--warning);"></i> Was kann ich verbessern?
                        </label>
                        <textarea id="reflCanImprove" rows="4" placeholder="Herausforderungen, Learnings, Optimierungspotential..." required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="reflThankYou">
                            <i class="fas fa-heart" style="color: var(--danger);"></i> Wen kann ich unterstützen / wem danken?
                        </label>
                        <textarea id="reflThankYou" rows="4" placeholder="Dankbarkeit, Teamwork, Unterstützung..." required></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="reset" class="btn btn-secondary">
                            <i class="fas fa-redo"></i> Zurücksetzen
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Reflexion speichern
                        </button>
                    </div>
                </form>
            </div>

            <div class="card mt-20">
                <div class="card-header">
                    <h2><i class="fas fa-history"></i> Gespeicherte Reflexionen</h2>
                </div>
                <div id="reflectionHistory"></div>
            </div>
        `;
    },

    init() {
        this.loadHistory();

        document.getElementById('reflectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReflection();
        });
    },

    saveReflection() {
        const reflection = {
            id: utils.generateId(),
            userId: authApp.currentUser.id,
            week: document.getElementById('reflWeek').value,
            newLeads: parseInt(document.getElementById('reflNewLeads').value),
            calls: parseInt(document.getElementById('reflCalls').value),
            followups: parseInt(document.getElementById('reflFollowups').value),
            closedDeals: parseInt(document.getElementById('reflClosedDeals').value),
            revenue: parseFloat(document.getElementById('reflRevenue').value),
            wentWell: document.getElementById('reflWentWell').value,
            canImprove: document.getElementById('reflCanImprove').value,
            thankYou: document.getElementById('reflThankYou').value,
            createdAt: Date.now()
        };

        db.addReflection(reflection);
        utils.showToast('Wochenreflexion erfolgreich gespeichert', 'success');
        
        // Reset form
        document.getElementById('reflectionForm').reset();
        document.getElementById('reflWeek').value = utils.getWeekNumber();
        
        // Reload history
        this.loadHistory();
    },

    loadHistory() {
        const reflections = db.getReflections(authApp.currentUser.id);
        const container = document.getElementById('reflectionHistory');

        if (reflections.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: var(--grey-light); display: block; margin-bottom: 15px;"></i>
                    <p class="text-muted">Noch keine Reflexionen gespeichert. Erstellen Sie Ihre erste Wochenreflexion!</p>
                </div>
            `;
            return;
        }

        // Sort by creation date, newest first
        const sorted = reflections.sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = sorted.map(refl => `
            <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--primary-blue);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div>
                        <h3 style="color: var(--primary-blue); margin-bottom: 5px;">
                            📅 ${refl.week}
                        </h3>
                        <p class="text-muted" style="font-size: 13px;">
                            Erstellt am ${utils.formatDate(new Date(refl.createdAt))}
                        </p>
                    </div>
                    <div class="action-btns">
                        <button class="btn-icon btn-success" onclick="reflectionPage.addToGoogleCalendar('${refl.id}')" title="Zu Google Calendar hinzufügen">
                            <i class="fab fa-google"></i>
                        </button>
                        <button class="btn-icon btn-info" onclick="reflectionPage.downloadICS('${refl.id}')" title=".ics Download (Apple Calendar, Outlook, etc.)">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="reflectionPage.deleteReflection('${refl.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="stats-grid" style="margin-bottom: 20px;">
                    <div class="stat-card">
                        <div class="stat-label">Neue Leads</div>
                        <div class="stat-value" style="font-size: 24px;">${refl.newLeads}</div>
                    </div>
                    <div class="stat-card gold">
                        <div class="stat-label">Gespräche</div>
                        <div class="stat-value" style="font-size: 24px;">${refl.calls}</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-label">Follow-ups</div>
                        <div class="stat-value" style="font-size: 24px;">${refl.followups}</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-label">Abschlüsse</div>
                        <div class="stat-value" style="font-size: 24px;">${refl.closedDeals}</div>
                    </div>
                </div>

                <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong style="color: var(--primary-blue);">💰 Umsatz:</strong> 
                    <span style="font-size: 20px; font-weight: 700;">${utils.formatCurrency(refl.revenue)}</span>
                </div>

                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--success); display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-smile"></i> Was lief gut?
                    </strong>
                    <p style="margin-left: 30px; color: var(--grey-dark);">${refl.wentWell}</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--warning); display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-chart-line"></i> Was kann ich verbessern?
                    </strong>
                    <p style="margin-left: 30px; color: var(--grey-dark);">${refl.canImprove}</p>
                </div>

                <div>
                    <strong style="color: var(--danger); display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-heart"></i> Dankbarkeit & Unterstützung
                    </strong>
                    <p style="margin-left: 30px; color: var(--grey-dark);">${refl.thankYou}</p>
                </div>
            </div>
        `).join('');
    },

    deleteReflection(id) {
        if (utils.confirm('Möchten Sie diese Reflexion wirklich löschen?')) {
            db.deleteReflection(id);
            utils.showToast('Reflexion wurde gelöscht', 'success');
            this.loadHistory();
        }
    },

    // Calendar Export Methods
    addToGoogleCalendar(id) {
        const reflections = db.getReflections();
        const reflection = reflections.find(r => r.id === id);
        if (!reflection) {
            utils.showToast('Reflexion nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.reflectionToEvent(reflection);
        calendarExport.openGoogleCalendar(event);
    },

    downloadICS(id) {
        const reflections = db.getReflections();
        const reflection = reflections.find(r => r.id === id);
        if (!reflection) {
            utils.showToast('Reflexion nicht gefunden', 'error');
            return;
        }
        
        const event = calendarExport.reflectionToEvent(reflection);
        const filename = `reflection_${reflection.week.toLowerCase().replace(/\s+/g, '_')}`;
        calendarExport.downloadICS(event, filename);
    }
};
