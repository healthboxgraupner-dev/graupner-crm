// Reports Module
const reportsModule = {
    render(container) {
        const leads = DB.get('leads');
        const stats = {
            total: leads.length,
            new: leads.filter(l => l.status === 'neu').length,
            contacted: leads.filter(l => l.status === 'kontaktiert').length,
            qualified: leads.filter(l => l.status === 'qualifiziert').length,
            closed: leads.filter(l => l.status === 'abgeschlossen').length,
            revenue: leads.filter(l => l.status === 'abgeschlossen').reduce((sum, l) => sum + l.amount, 0)
        };

        const conversionRate = stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="card">
                <h2>Berichte & Statistiken</h2>
                
                <div class="stats-grid" style="margin: 30px 0;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Gesamt Leads</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.closed}</div>
                        <div class="stat-label">Abgeschlossen</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${conversionRate}%</div>
                        <div class="stat-label">Conversion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatCurrency(stats.revenue)}</div>
                        <div class="stat-label">Gesamtumsatz</div>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3>Export-Optionen</h3>
                    <button class="btn btn-primary" onclick="reportsModule.exportCSV()">
                        <i class="fas fa-file-csv"></i> CSV Export
                    </button>
                    <button class="btn btn-primary" onclick="reportsModule.exportJSON()" style="margin-left: 10px;">
                        <i class="fas fa-file-code"></i> JSON Backup
                    </button>
                </div>

                <div style="margin-top: 30px;">
                    <canvas id="reportsChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;

        this.renderChart(stats);
    },

    renderChart(stats) {
        const ctx = document.getElementById('reportsChart');
        if (!ctx || !window.Chart) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Neu', 'Kontaktiert', 'Qualifiziert', 'Abgeschlossen'],
                datasets: [{
                    data: [stats.new, stats.contacted, stats.qualified, stats.closed],
                    backgroundColor: ['#356c89', '#d4af37', '#00d4ff', '#10b981']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Lead-Verteilung nach Status' }
                }
            }
        });
    },

    exportCSV() {
        const leads = DB.get('leads');
        const data = leads.map(l => ({
            Name: l.name,
            Email: l.email,
            Telefon: l.phone,
            Betrag: l.amount,
            Produkt: l.product,
            Status: l.status,
            Erstellt: formatDate(l.created)
        }));
        exportToCSV(data, `leads_export_${Date.now()}.csv`);
    },

    exportJSON() {
        const data = {
            leads: DB.get('leads'),
            followups: DB.get('followups'),
            calendar: DB.get('calendar'),
            activities: DB.get('activities'),
            exported: new Date().toISOString()
        };
        exportToJSON(data, `crm_backup_${Date.now()}.json`);
    }
};
