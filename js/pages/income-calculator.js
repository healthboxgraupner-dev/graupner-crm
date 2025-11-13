// ===================================
// Income Calculator & Goal Setting Page
// ===================================

const incomeCalculatorPage = {
    currentGoal: null,

    render() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-calculator"></i> Einkommens-Kalkulator</h1>
                <p>Setzen Sie Ihr Einkommensziel und berechnen Sie automatisch die benötigten Aktivitäten</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-target"></i> Mein Einkommensziel</h2>
                </div>

                <form id="incomeGoalForm">
                    <h3 style="margin: 20px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        💰 Gewünschtes Einkommen
                    </h3>
                    
                    <div class="form-group">
                        <label for="targetIncome">Monatliches Wunscheinkommen (€)</label>
                        <input type="number" id="targetIncome" min="0" step="100" placeholder="z.B. 10000" required>
                        <small class="text-muted">Ihr Netto-Ziel pro Monat</small>
                    </div>

                    <h3 style="margin: 25px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        📊 Ihre Provisionsstruktur
                    </h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="commissionPercent">Provisionsrate Einmalzahlung (%)</label>
                            <input type="number" id="commissionPercent" min="0" max="100" step="0.1" placeholder="z.B. 3" required>
                            <small class="text-muted">Ihre Provision vom Einmalumsatz</small>
                        </div>
                        <div class="form-group">
                            <label for="monthlyCommissionPercent">Monatliche Provision (%) - Optional</label>
                            <input type="number" id="monthlyCommissionPercent" min="0" max="100" step="0.1" placeholder="z.B. 1.5" value="0">
                            <small class="text-muted">Wiederkehrende monatliche Provision</small>
                        </div>
                    </div>

                    <h3 style="margin: 25px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        📈 Ihre Durchschnittswerte
                    </h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="avgInvestment">Durchschnittliche Investitionssumme (€)</label>
                            <input type="number" id="avgInvestment" min="0" step="100" placeholder="z.B. 22000" required>
                            <small class="text-muted">Was gibt ein Kunde im Schnitt aus?</small>
                        </div>
                        <div class="form-group">
                            <label for="avgMonthlyRecurring">Monatlicher Folgeumsatz (€) - Optional</label>
                            <input type="number" id="avgMonthlyRecurring" min="0" step="10" placeholder="z.B. 500" value="0">
                            <small class="text-muted">Wiederkehrender Umsatz pro Kunde/Monat</small>
                        </div>
                    </div>

                    <h3 style="margin: 25px 0 15px 0; color: var(--primary-blue); font-size: 18px;">
                        🎯 Ihre Conversion-Raten
                    </h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="leadToCallRate">Lead → Gespräch (%)</label>
                            <input type="number" id="leadToCallRate" min="0" max="100" step="1" placeholder="z.B. 50" required>
                            <small class="text-muted">Von 100 Leads werden X zu Gesprächen</small>
                        </div>
                        <div class="form-group">
                            <label for="callToCloseRate">Gespräch → Abschluss (%)</label>
                            <input type="number" id="callToCloseRate" min="0" max="100" step="1" placeholder="z.B. 50" required>
                            <small class="text-muted">Von 100 Gesprächen werden X abgeschlossen</small>
                        </div>
                    </div>

                    <div class="info-text" style="margin-top: 20px;">
                        <i class="fas fa-lightbulb"></i> 
                        <strong>Tipp:</strong> Basieren Sie die Conversion-Raten auf Ihren echten Daten aus den letzten Monaten für präzise Ergebnisse.
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-calculator"></i> Jetzt berechnen
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="incomeCalculatorPage.resetForm()">
                            <i class="fas fa-redo"></i> Zurücksetzen
                        </button>
                    </div>
                </form>
            </div>

            <div id="calculationResults" style="display: none;">
                <!-- Results will be rendered here -->
            </div>
        `;
    },

    init() {
        this.loadSavedGoal();
        
        document.getElementById('incomeGoalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateGoals();
        });

        // Real-time validation
        const inputs = document.querySelectorAll('#incomeGoalForm input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    },

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;

        if (value < min || value > max || isNaN(value)) {
            input.style.borderColor = 'var(--danger)';
        } else {
            input.style.borderColor = '';
        }
    },

    calculateGoals() {
        // Get form values
        const targetIncome = parseFloat(document.getElementById('targetIncome').value);
        const commissionPercent = parseFloat(document.getElementById('commissionPercent').value);
        const monthlyCommissionPercent = parseFloat(document.getElementById('monthlyCommissionPercent').value) || 0;
        const avgInvestment = parseFloat(document.getElementById('avgInvestment').value);
        const avgMonthlyRecurring = parseFloat(document.getElementById('avgMonthlyRecurring').value) || 0;
        const leadToCallRate = parseFloat(document.getElementById('leadToCallRate').value) / 100;
        const callToCloseRate = parseFloat(document.getElementById('callToCloseRate').value) / 100;

        // Calculate required deals
        const commissionPerDeal = (avgInvestment * commissionPercent / 100);
        const monthlyRecurringPerDeal = (avgMonthlyRecurring * monthlyCommissionPercent / 100);
        const totalCommissionPerDeal = commissionPerDeal + monthlyRecurringPerDeal;

        const requiredDeals = Math.ceil(targetIncome / totalCommissionPerDeal);
        
        // Calculate required calls
        const requiredCalls = Math.ceil(requiredDeals / callToCloseRate);
        
        // Calculate required leads
        const requiredLeads = Math.ceil(requiredCalls / leadToCallRate);

        // Calculate total revenue
        const totalRevenue = requiredDeals * avgInvestment;
        const totalRecurringRevenue = requiredDeals * avgMonthlyRecurring;

        // Overall conversion rate
        const overallConversionRate = (leadToCallRate * callToCloseRate * 100).toFixed(1);

        // Weekly breakdown
        const weeksPerMonth = 4.33;
        const leadsPerWeek = Math.ceil(requiredLeads / weeksPerMonth);
        const callsPerWeek = Math.ceil(requiredCalls / weeksPerMonth);
        const dealsPerWeek = Math.ceil(requiredDeals / weeksPerMonth);

        // Daily breakdown (assuming 5 working days)
        const leadsPerDay = Math.ceil(leadsPerWeek / 5);
        const callsPerDay = Math.ceil(callsPerWeek / 5);

        // Save goal
        const goalData = {
            targetIncome,
            commissionPercent,
            monthlyCommissionPercent,
            avgInvestment,
            avgMonthlyRecurring,
            leadToCallRate: leadToCallRate * 100,
            callToCloseRate: callToCloseRate * 100,
            requiredLeads,
            requiredCalls,
            requiredDeals,
            totalRevenue,
            totalRecurringRevenue,
            overallConversionRate,
            leadsPerWeek,
            callsPerWeek,
            dealsPerWeek,
            leadsPerDay,
            callsPerDay,
            commissionPerDeal,
            totalCommissionPerDeal,
            createdAt: Date.now()
        };

        this.currentGoal = goalData;
        this.saveGoal(goalData);

        // Render results
        this.renderResults(goalData);

        // Show results section
        document.getElementById('calculationResults').style.display = 'block';
        
        // Scroll to results
        document.getElementById('calculationResults').scrollIntoView({ behavior: 'smooth' });

        utils.showToast('Berechnung erfolgreich! Ihr Aktionsplan ist bereit.', 'success');
    },

    renderResults(goal) {
        const container = document.getElementById('calculationResults');
        
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid var(--success);">
                <div class="card-header">
                    <h2><i class="fas fa-chart-line"></i> Ihr Aktionsplan für ${utils.formatCurrency(goal.targetIncome)} / Monat</h2>
                </div>

                <div class="stats-grid" style="margin-bottom: 30px;">
                    <div class="stat-card success">
                        <div class="stat-icon"><i class="fas fa-bullseye"></i></div>
                        <div class="stat-label">Benötigte Abschlüsse</div>
                        <div class="stat-value">${goal.requiredDeals}</div>
                        <div class="stat-change positive">≈ ${goal.dealsPerWeek} / Woche</div>
                    </div>
                    <div class="stat-card gold">
                        <div class="stat-icon"><i class="fas fa-phone"></i></div>
                        <div class="stat-label">Benötigte Gespräche</div>
                        <div class="stat-value">${goal.requiredCalls}</div>
                        <div class="stat-change positive">≈ ${goal.callsPerWeek} / Woche</div>
                    </div>
                    <div class="stat-card primary">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-label">Benötigte Leads</div>
                        <div class="stat-value">${goal.requiredLeads}</div>
                        <div class="stat-change positive">≈ ${goal.leadsPerWeek} / Woche</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon"><i class="fas fa-euro-sign"></i></div>
                        <div class="stat-label">Zu generierender Umsatz</div>
                        <div class="stat-value">${utils.formatCurrency(goal.totalRevenue)}</div>
                        <div class="stat-change">Einmalzahlung</div>
                    </div>
                </div>

                <div style="background: var(--grey-lighter); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: var(--primary-blue); margin-bottom: 15px;">
                        <i class="fas fa-calendar-week"></i> Wöchentliche Aktivitäten
                    </h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label style="font-weight: 600; color: var(--grey-dark);">Montag - Freitag</label>
                            <div style="display: flex; gap: 15px; margin-top: 10px;">
                                <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 28px; font-weight: 700; color: var(--primary-blue);">${goal.leadsPerDay}</div>
                                    <div style="font-size: 14px; color: var(--grey); margin-top: 5px;">Leads / Tag</div>
                                </div>
                                <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 28px; font-weight: 700; color: var(--gold);">${goal.callsPerDay}</div>
                                    <div style="font-size: 14px; color: var(--grey); margin-top: 5px;">Gespräche / Tag</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, var(--primary-blue) 0%, #2563eb 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-trophy"></i> Ihre Provision pro Abschluss
                    </h3>
                    <div style="display: flex; justify-content: space-around; text-align: center;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Einmalprovision</div>
                            <div style="font-size: 32px; font-weight: 700;">${utils.formatCurrency(goal.commissionPerDeal)}</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${goal.commissionPercent}% von ${utils.formatCurrency(goal.avgInvestment)}</div>
                        </div>
                        ${goal.totalCommissionPerDeal > goal.commissionPerDeal ? `
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">+ Monatlich</div>
                            <div style="font-size: 32px; font-weight: 700;">${utils.formatCurrency(goal.totalCommissionPerDeal - goal.commissionPerDeal)}</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${goal.monthlyCommissionPercent}% wiederkehrend</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <i class="fas fa-percentage" style="color: var(--primary-blue); font-size: 20px;"></i>
                            <strong style="color: var(--grey-dark);">Ihre Gesamt-Conversion</strong>
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-blue);">${goal.overallConversionRate}%</div>
                        <div style="font-size: 13px; color: var(--grey); margin-top: 5px;">Von Lead zu Abschluss</div>
                    </div>

                    <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <i class="fas fa-chart-pie" style="color: var(--gold); font-size: 20px;"></i>
                            <strong style="color: var(--grey-dark);">Lead → Gespräch</strong>
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--gold);">${goal.leadToCallRate}%</div>
                        <div style="font-size: 13px; color: var(--grey); margin-top: 5px;">${Math.round(100 / goal.leadToCallRate * 100) / 100} Leads = 1 Gespräch</div>
                    </div>

                    <div style="background: var(--grey-lighter); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <i class="fas fa-handshake" style="color: var(--success); font-size: 20px;"></i>
                            <strong style="color: var(--grey-dark);">Gespräch → Abschluss</strong>
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--success);">${goal.callToCloseRate}%</div>
                        <div style="font-size: 13px; color: var(--grey); margin-top: 5px;">${Math.round(100 / goal.callToCloseRate * 100) / 100} Gespräche = 1 Deal</div>
                    </div>
                </div>

                <div class="info-text" style="margin-top: 20px;">
                    <i class="fas fa-info-circle"></i>
                    <strong>Hinweis:</strong> Diese Berechnung basiert auf Ihren angegebenen Durchschnittswerten. 
                    Verfolgen Sie Ihre tatsächlichen Zahlen im Dashboard, um Ihre Conversion-Raten zu optimieren.
                </div>

                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="app.navigateTo('dashboard')">
                        <i class="fas fa-chart-bar"></i> Zum Dashboard
                    </button>
                    <button class="btn btn-gold" onclick="incomeCalculatorPage.exportGoalPDF()">
                        <i class="fas fa-file-pdf"></i> Als PDF exportieren
                    </button>
                    <button class="btn btn-secondary" onclick="incomeCalculatorPage.shareGoal()">
                        <i class="fas fa-share-alt"></i> Ziel teilen
                    </button>
                </div>
            </div>
        `;
    },

    resetForm() {
        document.getElementById('incomeGoalForm').reset();
        document.getElementById('calculationResults').style.display = 'none';
        utils.showToast('Formular zurückgesetzt', 'info');
    },

    saveGoal(goal) {
        localStorage.setItem('healthbox_income_goal', JSON.stringify(goal));
    },

    loadSavedGoal() {
        const saved = localStorage.getItem('healthbox_income_goal');
        if (saved) {
            this.currentGoal = JSON.parse(saved);
            this.fillForm(this.currentGoal);
        }
    },

    fillForm(goal) {
        document.getElementById('targetIncome').value = goal.targetIncome;
        document.getElementById('commissionPercent').value = goal.commissionPercent;
        document.getElementById('monthlyCommissionPercent').value = goal.monthlyCommissionPercent || 0;
        document.getElementById('avgInvestment').value = goal.avgInvestment;
        document.getElementById('avgMonthlyRecurring').value = goal.avgMonthlyRecurring || 0;
        document.getElementById('leadToCallRate').value = goal.leadToCallRate;
        document.getElementById('callToCloseRate').value = goal.callToCloseRate;

        // Auto-calculate if all fields are filled
        setTimeout(() => {
            this.calculateGoals();
        }, 100);
    },

    exportGoalPDF() {
        if (!this.currentGoal) {
            utils.showToast('Bitte berechnen Sie zuerst Ihr Ziel', 'error');
            return;
        }

        utils.showToast('PDF-Export wird vorbereitet...', 'info');
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add content
        doc.setFontSize(20);
        doc.text('HEALTHBOX - Einkommens-Aktionsplan', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Erstellt am: ${utils.formatDate(new Date(this.currentGoal.createdAt))}`, 105, 30, { align: 'center' });

        let y = 50;
        
        doc.setFontSize(16);
        doc.text('Mein Einkommensziel', 20, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Monatliches Wunscheinkommen: ${utils.formatCurrency(this.currentGoal.targetIncome)}`, 20, y);
        y += 15;

        doc.setFontSize(16);
        doc.text('Benötigte Aktivitäten', 20, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Benötigte Leads pro Monat: ${this.currentGoal.requiredLeads}`, 20, y);
        y += 7;
        doc.text(`Benötigte Gespräche pro Monat: ${this.currentGoal.requiredCalls}`, 20, y);
        y += 7;
        doc.text(`Benötigte Abschlüsse pro Monat: ${this.currentGoal.requiredDeals}`, 20, y);
        y += 15;

        doc.setFontSize(16);
        doc.text('Wöchentlicher Plan', 20, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Leads pro Woche: ${this.currentGoal.leadsPerWeek}`, 20, y);
        y += 7;
        doc.text(`Gespräche pro Woche: ${this.currentGoal.callsPerWeek}`, 20, y);
        y += 7;
        doc.text(`Abschlüsse pro Woche: ${this.currentGoal.dealsPerWeek}`, 20, y);
        y += 15;

        doc.setFontSize(16);
        doc.text('Täglicher Plan (Mo-Fr)', 20, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Leads pro Tag: ${this.currentGoal.leadsPerDay}`, 20, y);
        y += 7;
        doc.text(`Gespräche pro Tag: ${this.currentGoal.callsPerDay}`, 20, y);
        y += 15;

        doc.setFontSize(16);
        doc.text('Provisionsstruktur', 20, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Provision pro Abschluss: ${utils.formatCurrency(this.currentGoal.commissionPerDeal)}`, 20, y);
        y += 7;
        doc.text(`Durchschnittliche Investition: ${utils.formatCurrency(this.currentGoal.avgInvestment)}`, 20, y);
        y += 7;
        doc.text(`Gesamt-Conversion: ${this.currentGoal.overallConversionRate}%`, 20, y);

        // Save PDF
        doc.save(`HEALTHBOX_Aktionsplan_${utils.getTodayString()}.pdf`);
        
        utils.showToast('PDF erfolgreich exportiert!', 'success');
    },

    shareGoal() {
        if (!this.currentGoal) {
            utils.showToast('Bitte berechnen Sie zuerst Ihr Ziel', 'error');
            return;
        }

        const text = `🎯 Mein HEALTHBOX Einkommensziel: ${utils.formatCurrency(this.currentGoal.targetIncome)}/Monat

📊 Mein Aktionsplan:
• ${this.currentGoal.requiredLeads} Leads
• ${this.currentGoal.requiredCalls} Gespräche  
• ${this.currentGoal.requiredDeals} Abschlüsse

💪 Pro Woche:
• ${this.currentGoal.leadsPerWeek} Leads
• ${this.currentGoal.callsPerWeek} Gespräche
• ${this.currentGoal.dealsPerWeek} Abschlüsse

🔥 Conversion: ${this.currentGoal.overallConversionRate}%

#HEALTHBOX #Erfolg #Vertrieb`;

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            utils.showToast('Aktionsplan in Zwischenablage kopiert! Jetzt teilen.', 'success');
        }).catch(() => {
            // Fallback: Show modal with text
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-share-alt"></i> Ihr Aktionsplan zum Teilen</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <textarea readonly style="width: 100%; height: 300px; font-family: monospace; padding: 15px; border: 1px solid var(--grey-light); border-radius: 8px;">${text}</textarea>
                        <p class="info-text" style="margin-top: 15px;">
                            <i class="fas fa-info-circle"></i> Kopieren Sie den Text und teilen Sie ihn mit Ihrem Team!
                        </p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        });
    }
};
