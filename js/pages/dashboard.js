// ===================================
// Dashboard Page
// ===================================

const dashboardPage = {
    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
                <p>Übersicht Ihrer Aktivitäten und Performance</p>
            </div>

            <div id="dashboardStats"></div>
            <div id="dashboardCharts"></div>
            <div id="recentActivity"></div>
        `;
    },

    init() {
        this.renderGoalProgress();
        this.renderStats();
        this.renderCharts();
        this.renderRecentActivity();
    },

    renderGoalProgress() {
        // Check if user has set income goal
        const goalData = localStorage.getItem('healthbox_income_goal');
        if (!goalData) {
            // Show prompt to set goal
            const html = `
                <div class="card" style="background: linear-gradient(135deg, var(--primary-blue) 0%, #2563eb 100%); color: white; margin-bottom: 20px; border: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-bullseye"></i> Setzen Sie Ihr Einkommensziel!
                            </h3>
                            <p style="opacity: 0.9; margin-bottom: 15px;">
                                Berechnen Sie automatisch, wie viele Leads und Gespräche Sie für Ihr Wunscheinkommen benötigen.
                            </p>
                            <button class="btn btn-gold" onclick="app.navigateTo('income-calculator')" style="background: var(--gold); color: var(--primary-blue);">
                                <i class="fas fa-calculator"></i> Jetzt Ziel berechnen
                            </button>
                        </div>
                        <i class="fas fa-chart-line" style="font-size: 80px; opacity: 0.2;"></i>
                    </div>
                </div>
            `;
            document.getElementById('dashboardStats').insertAdjacentHTML('beforebegin', html);
            return;
        }

        // Load goal and compare with actual data
        const goal = JSON.parse(goalData);
        const userId = authApp.currentUser.id;
        const leads = db.getLeads(userId);
        const calls = db.getCalls(userId);
        const monthlyData = db.getMonthlyData(userId);

        // Get current month data
        const currentMonth = new Date().toLocaleString('de-DE', { month: 'long' });
        const currentMonthData = monthlyData.find(m => m.month === currentMonth);
        
        const actualDeals = currentMonthData?.closedDeals || 0;
        const actualCalls = calls.filter(c => {
            const callDate = new Date(c.date);
            const now = new Date();
            return callDate.getMonth() === now.getMonth() && callDate.getFullYear() === now.getFullYear();
        }).length;
        const actualLeads = leads.filter(l => {
            const leadDate = new Date(l.createdAt || Date.now());
            const now = new Date();
            return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
        }).length;

        // Calculate progress percentages
        const dealsProgress = Math.min(100, Math.round((actualDeals / goal.requiredDeals) * 100));
        const callsProgress = Math.min(100, Math.round((actualCalls / goal.requiredCalls) * 100));
        const leadsProgress = Math.min(100, Math.round((actualLeads / goal.requiredLeads) * 100));

        // Calculate projected income
        const actualRevenue = currentMonthData?.revenue || 0;
        const actualCommission = actualRevenue * (goal.commissionPercent / 100);
        const projectedIncome = actualCommission;

        const html = `
            <div class="card" style="background: linear-gradient(135deg, var(--primary-blue) 0%, #2563eb 100%); color: white; margin-bottom: 20px; border: none;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin-bottom: 5px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-target"></i> Ihr Einkommensziel: ${utils.formatCurrency(goal.targetIncome)} / Monat
                        </h3>
                        <p style="opacity: 0.9; font-size: 14px;">
                            Aktuelles Einkommen diesen Monat: <strong>${utils.formatCurrency(projectedIncome)}</strong>
                            ${projectedIncome >= goal.targetIncome ? ' 🎉 <strong>ZIEL ERREICHT!</strong>' : ''}
                        </p>
                    </div>
                    <button class="btn btn-sm" onclick="app.navigateTo('income-calculator')" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">
                        <i class="fas fa-edit"></i> Anpassen
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 14px; opacity: 0.9;">Leads</span>
                            <span style="font-weight: 700; font-size: 16px;">${actualLeads} / ${goal.requiredLeads}</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${leadsProgress >= 100 ? '#10b981' : '#fbbf24'}; height: 100%; width: ${leadsProgress}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${leadsProgress}% erreicht</div>
                    </div>

                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 14px; opacity: 0.9;">Gespräche</span>
                            <span style="font-weight: 700; font-size: 16px;">${actualCalls} / ${goal.requiredCalls}</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${callsProgress >= 100 ? '#10b981' : '#fbbf24'}; height: 100%; width: ${callsProgress}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${callsProgress}% erreicht</div>
                    </div>

                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 14px; opacity: 0.9;">Abschlüsse</span>
                            <span style="font-weight: 700; font-size: 16px;">${actualDeals} / ${goal.requiredDeals}</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${dealsProgress >= 100 ? '#10b981' : '#fbbf24'}; height: 100%; width: ${dealsProgress}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${dealsProgress}% erreicht</div>
                    </div>
                </div>

                ${projectedIncome < goal.targetIncome ? `
                <div style="margin-top: 15px; padding: 12px; background: rgba(251, 191, 36, 0.2); border-radius: 8px; border-left: 4px solid #fbbf24;">
                    <strong><i class="fas fa-lightbulb"></i> Noch benötigt:</strong><br>
                    <span style="font-size: 14px; opacity: 0.9;">
                        ${goal.requiredLeads - actualLeads > 0 ? `${goal.requiredLeads - actualLeads} Leads` : '✅ Leads-Ziel erreicht'} • 
                        ${goal.requiredCalls - actualCalls > 0 ? `${goal.requiredCalls - actualCalls} Gespräche` : '✅ Gesprächs-Ziel erreicht'} • 
                        ${goal.requiredDeals - actualDeals > 0 ? `${goal.requiredDeals - actualDeals} Abschlüsse` : '✅ Abschluss-Ziel erreicht'}
                    </span>
                </div>
                ` : `
                <div style="margin-top: 15px; padding: 12px; background: rgba(16, 185, 129, 0.2); border-radius: 8px; border-left: 4px solid #10b981;">
                    <strong><i class="fas fa-trophy"></i> Glückwunsch! Ihr Monatsziel ist erreicht! 🎉</strong>
                </div>
                `}
            </div>
        `;

        document.getElementById('dashboardStats').insertAdjacentHTML('beforebegin', html);
    },

    renderStats() {
        const userId = authApp.currentUser.id;
        const leads = db.getLeads(userId);
        const calls = db.getCalls(userId);
        const followups = db.getFollowups(userId);
        const monthlyData = db.getMonthlyData(userId);

        // Calculate stats
        const totalLeads = leads.length;
        const newLeads = leads.filter(l => l.status === 'neu').length;
        const totalCalls = calls.length;
        const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0);
        const totalDeals = monthlyData.reduce((sum, m) => sum + (m.closedDeals || 0), 0);
        const overdueFollowups = followups.filter(f => utils.isOverdue(f.nextContact)).length;
        const conversionRate = utils.calculateConversion(totalDeals, totalCalls);

        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Gesamt Leads</span>
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totalLeads}</div>
                    <div class="stat-change">
                        <span>${newLeads} neue Leads</span>
                    </div>
                </div>

                <div class="stat-card gold">
                    <div class="stat-header">
                        <span class="stat-label">Gespräche</span>
                        <div class="stat-icon gold">
                            <i class="fas fa-phone"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totalCalls}</div>
                    <div class="stat-change">
                        <span>Insgesamt durchgeführt</span>
                    </div>
                </div>

                <div class="stat-card success">
                    <div class="stat-header">
                        <span class="stat-label">Abschlüsse</span>
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totalDeals}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>${utils.formatPercentage(conversionRate)} Conversion</span>
                    </div>
                </div>

                <div class="stat-card warning">
                    <div class="stat-header">
                        <span class="stat-label">Umsatz</span>
                        <div class="stat-icon warning">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value" style="font-size: 24px;">${utils.formatCurrency(totalRevenue)}</div>
                    <div class="stat-change">
                        <span>Gesamt generiert</span>
                    </div>
                </div>

                ${overdueFollowups > 0 ? `
                <div class="stat-card danger">
                    <div class="stat-header">
                        <span class="stat-label">Überfällige Follow-ups</span>
                        <div class="stat-icon danger">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div class="stat-value">${overdueFollowups}</div>
                    <div class="stat-change">
                        <span>Benötigen Aufmerksamkeit</span>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        document.getElementById('dashboardStats').innerHTML = html;
    },

    renderCharts() {
        // Admin sees all users, team leaders see their team, partners see only themselves
        let userIds = [authApp.currentUser.id];
        
        if (authApp.isAdmin() || authApp.isTeamLeader()) {
            userIds = authApp.getAccessibleUserIds();
        }

        const monthlyData = [];
        userIds.forEach(userId => {
            const data = db.getMonthlyData(userId);
            monthlyData.push(...data);
        });

        // Aggregate by month
        const monthlyAgg = {};
        monthlyData.forEach(m => {
            const key = `${m.year}-${m.month}`;
            if (!monthlyAgg[key]) {
                monthlyAgg[key] = {
                    month: m.month,
                    year: m.year,
                    newLeads: 0,
                    calls: 0,
                    closedDeals: 0,
                    revenue: 0
                };
            }
            monthlyAgg[key].newLeads += m.newLeads || 0;
            monthlyAgg[key].calls += m.calls || 0;
            monthlyAgg[key].closedDeals += m.closedDeals || 0;
            monthlyAgg[key].revenue += m.revenue || 0;
        });

        const sortedData = Object.values(monthlyAgg).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        const labels = sortedData.map(d => utils.getMonthName(d.month));
        const leadsData = sortedData.map(d => d.newLeads);
        const revenueData = sortedData.map(d => d.revenue);

        const html = `
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-chart-bar"></i> Monatliche Entwicklung</h2>
                </div>
                <div class="chart-container">
                    <canvas id="monthlyChart"></canvas>
                </div>
            </div>
        `;

        document.getElementById('dashboardCharts').innerHTML = html;

        // Create chart
        setTimeout(() => {
            const ctx = document.getElementById('monthlyChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Neue Leads',
                                data: leadsData,
                                borderColor: '#1e3a8a',
                                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                                tension: 0.3
                            },
                            {
                                label: 'Umsatz (€)',
                                data: revenueData,
                                borderColor: '#d4af37',
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                tension: 0.3,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left'
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        }
                    }
                });
            }
        }, 100);
    },

    renderRecentActivity() {
        const userId = authApp.currentUser.id;
        const leads = db.getLeads(userId).slice(-5).reverse();
        const calls = db.getCalls(userId).slice(-5).reverse();

        const html = `
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-history"></i> Letzte Aktivitäten</h2>
                </div>
                
                <h3 style="margin-bottom: 15px; font-size: 16px;">
                    <i class="fas fa-users"></i> Neueste Leads
                </h3>
                ${leads.length > 0 ? `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Kontakt</th>
                                    <th>Quelle</th>
                                    <th>Status</th>
                                    <th>Follow-up</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${leads.map(lead => `
                                    <tr>
                                        <td>${utils.formatDate(lead.date)}</td>
                                        <td>${lead.contactName}</td>
                                        <td>${lead.source}</td>
                                        <td>
                                            <span class="status-badge status-${lead.status}">
                                                ${utils.getStatusEmoji(lead.status)} ${utils.getStatusLabel(lead.status)}
                                            </span>
                                        </td>
                                        <td>${utils.formatDate(lead.followupDate)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-muted">Noch keine Leads vorhanden</p>'}

                <h3 style="margin: 25px 0 15px 0; font-size: 16px;">
                    <i class="fas fa-phone"></i> Neueste Gespräche
                </h3>
                ${calls.length > 0 ? `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Partner</th>
                                    <th>Thema</th>
                                    <th>Ergebnis</th>
                                    <th>Dauer</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${calls.map(call => `
                                    <tr>
                                        <td>${utils.formatDate(call.date)}</td>
                                        <td>${call.partner}</td>
                                        <td>${call.topic}</td>
                                        <td>${call.result}</td>
                                        <td>${call.duration}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-muted">Noch keine Gespräche dokumentiert</p>'}
            </div>
        `;

        document.getElementById('recentActivity').innerHTML = html;
    }
};
