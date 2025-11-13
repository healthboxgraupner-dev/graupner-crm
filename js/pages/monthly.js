// ===================================
// Monthly Overview Page
// ===================================

const monthlyPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-calendar-alt"></i> Monatsübersicht</h1>
                <p>Jahresübersicht mit automatischer Conversion-Berechnung</p>
            </div>

            <div class="page-actions">
                <button class="btn btn-gold" onclick="exportData.exportMonthlyData('${authApp.currentUser.id}')">
                    <i class="fas fa-file-excel"></i> Excel Export
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Monatsdaten ${new Date().getFullYear()}</h2>
                </div>

                <div class="table-container">
                    <table class="data-table" id="monthlyTable">
                        <thead>
                            <tr>
                                <th>Monat</th>
                                <th>Neue Leads</th>
                                <th>Gespräche</th>
                                <th>Abschlüsse</th>
                                <th>Umsatz (€)</th>
                                <th>Conversion (%)</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="monthlyTableBody">
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card mt-20">
                <div class="card-header">
                    <h2><i class="fas fa-chart-pie"></i> Jahresübersicht</h2>
                </div>
                <div id="yearSummary"></div>
                <div class="chart-container">
                    <canvas id="monthlyPerformanceChart"></canvas>
                </div>
            </div>
        `;
    },

    init() {
        this.loadMonthlyData();
        this.loadYearSummary();
        this.renderChart();
    },

    loadMonthlyData() {
        const currentYear = new Date().getFullYear();
        const tbody = document.getElementById('monthlyTableBody');
        const existingData = db.getMonthlyData(authApp.currentUser.id);
        
        let html = '';
        
        for (let month = 0; month < 12; month++) {
            const monthData = existingData.find(d => d.month === month && d.year === currentYear);
            
            if (monthData) {
                const conversion = utils.calculateConversion(monthData.closedDeals, monthData.calls);
                html += `
                    <tr data-id="${monthData.id}">
                        <td><strong>${utils.getMonthName(month)}</strong></td>
                        <td>${monthData.newLeads || 0}</td>
                        <td>${monthData.calls || 0}</td>
                        <td>${monthData.closedDeals || 0}</td>
                        <td><strong>${utils.formatCurrency(monthData.revenue || 0)}</strong></td>
                        <td>
                            <span class="status-badge ${conversion > 20 ? 'status-approved' : conversion > 10 ? 'status-pending' : 'status-inactive'}">
                                ${utils.formatPercentage(conversion)}
                            </span>
                        </td>
                        <td>
                            <button class="btn-icon btn-primary" onclick="monthlyPage.editMonth(${month}, ${currentYear})" title="Bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            } else {
                html += `
                    <tr>
                        <td><strong>${utils.getMonthName(month)}</strong></td>
                        <td class="text-muted">-</td>
                        <td class="text-muted">-</td>
                        <td class="text-muted">-</td>
                        <td class="text-muted">-</td>
                        <td class="text-muted">-</td>
                        <td>
                            <button class="btn-icon btn-success" onclick="monthlyPage.editMonth(${month}, ${currentYear})" title="Hinzufügen">
                                <i class="fas fa-plus"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }
        }
        
        tbody.innerHTML = html;
    },

    loadYearSummary() {
        const currentYear = new Date().getFullYear();
        const monthlyData = db.getMonthlyData(authApp.currentUser.id).filter(d => d.year === currentYear);
        
        const totals = {
            leads: monthlyData.reduce((sum, m) => sum + (m.newLeads || 0), 0),
            calls: monthlyData.reduce((sum, m) => sum + (m.calls || 0), 0),
            deals: monthlyData.reduce((sum, m) => sum + (m.closedDeals || 0), 0),
            revenue: monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0)
        };
        
        const avgConversion = utils.calculateConversion(totals.deals, totals.calls);

        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Gesamt Leads</span>
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totals.leads}</div>
                    <div class="stat-change text-muted">Jahr ${currentYear}</div>
                </div>

                <div class="stat-card gold">
                    <div class="stat-header">
                        <span class="stat-label">Gesamt Gespräche</span>
                        <div class="stat-icon gold">
                            <i class="fas fa-phone"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totals.calls}</div>
                    <div class="stat-change text-muted">Jahr ${currentYear}</div>
                </div>

                <div class="stat-card success">
                    <div class="stat-header">
                        <span class="stat-label">Gesamt Abschlüsse</span>
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totals.deals}</div>
                    <div class="stat-change">
                        <span>Ø ${utils.formatPercentage(avgConversion)} Conversion</span>
                    </div>
                </div>

                <div class="stat-card warning">
                    <div class="stat-header">
                        <span class="stat-label">Gesamt Umsatz</span>
                        <div class="stat-icon warning">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value" style="font-size: 20px;">${utils.formatCurrency(totals.revenue)}</div>
                    <div class="stat-change text-muted">Jahr ${currentYear}</div>
                </div>
            </div>
        `;

        document.getElementById('yearSummary').innerHTML = html;
    },

    renderChart() {
        const currentYear = new Date().getFullYear();
        const monthlyData = db.getMonthlyData(authApp.currentUser.id).filter(d => d.year === currentYear);
        
        const labels = [];
        const leadsData = [];
        const callsData = [];
        const dealsData = [];
        const conversionData = [];

        for (let month = 0; month < 12; month++) {
            const data = monthlyData.find(d => d.month === month);
            labels.push(utils.getMonthName(month).substring(0, 3));
            
            if (data) {
                leadsData.push(data.newLeads || 0);
                callsData.push(data.calls || 0);
                dealsData.push(data.closedDeals || 0);
                conversionData.push(utils.calculateConversion(data.closedDeals, data.calls));
            } else {
                leadsData.push(0);
                callsData.push(0);
                dealsData.push(0);
                conversionData.push(0);
            }
        }

        setTimeout(() => {
            const ctx = document.getElementById('monthlyPerformanceChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Leads',
                                data: leadsData,
                                backgroundColor: 'rgba(30, 58, 138, 0.8)',
                                borderColor: '#1e3a8a',
                                borderWidth: 1
                            },
                            {
                                label: 'Gespräche',
                                data: callsData,
                                backgroundColor: 'rgba(212, 175, 55, 0.8)',
                                borderColor: '#d4af37',
                                borderWidth: 1
                            },
                            {
                                label: 'Abschlüsse',
                                data: dealsData,
                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                borderColor: '#10b981',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: `Performance ${currentYear}`,
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    },

    editMonth(month, year) {
        const existingData = db.getMonthlyData(authApp.currentUser.id).find(d => d.month === month && d.year === year);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar"></i> ${utils.getMonthName(month)} ${year}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="monthForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="monthLeads">Neue Leads</label>
                                <input type="number" id="monthLeads" min="0" value="${existingData?.newLeads || 0}" required>
                            </div>
                            <div class="form-group">
                                <label for="monthCalls">Gespräche</label>
                                <input type="number" id="monthCalls" min="0" value="${existingData?.calls || 0}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="monthDeals">Abschlüsse</label>
                                <input type="number" id="monthDeals" min="0" value="${existingData?.closedDeals || 0}" required>
                            </div>
                            <div class="form-group">
                                <label for="monthRevenue">Umsatz (€)</label>
                                <input type="number" id="monthRevenue" min="0" step="0.01" value="${existingData?.revenue || 0}" required>
                            </div>
                        </div>
                        <div class="info-text">
                            <i class="fas fa-info-circle"></i> <strong>Conversion:</strong> Wird automatisch berechnet aus (Abschlüsse ÷ Gespräche) × 100
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

        document.getElementById('monthForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const data = {
                id: existingData?.id || utils.generateId(),
                userId: authApp.currentUser.id,
                month: month,
                year: year,
                newLeads: parseInt(document.getElementById('monthLeads').value),
                calls: parseInt(document.getElementById('monthCalls').value),
                closedDeals: parseInt(document.getElementById('monthDeals').value),
                revenue: parseFloat(document.getElementById('monthRevenue').value)
            };

            if (existingData) {
                db.updateMonthlyData(data.id, data);
                utils.showToast('Monatsdaten aktualisiert', 'success');
            } else {
                db.addMonthlyData(data);
                utils.showToast('Monatsdaten hinzugefügt', 'success');
            }
            
            this.loadMonthlyData();
            this.loadYearSummary();
            this.renderChart();
            modal.remove();
        });
    }
};
