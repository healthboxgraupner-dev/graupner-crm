// ===================================
// Calculator Module
// ===================================

const calculatorModule = {
    render(container) {
        container.innerHTML = `
            <div class="card">
                <h2>💰 Einkommensrechner</h2>
                <p style="color: var(--gray-600); margin-bottom: 30px;">
                    Berechnen Sie Ihre Provisionen und Zieleinkommen basierend auf HealthBox-Produkten
                </p>

                <!-- Produkt-Übersicht -->
                <div style="margin-bottom: 40px;">
                    <h3>HealthBox Produkte & Renditen</h3>
                    ${this.renderProductTable()}
                </div>

                <!-- Provisions-Rechner -->
                <div style="background: var(--gray-50); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
                    <h3>Provisions-Rechner</h3>
                    
                    <div class="form-group">
                        <label>HealthBox Produkt</label>
                        <select id="calcProduct" onchange="calculatorModule.calculate()">
                            <option value="">Bitte wählen...</option>
                            <option value="HealthBox Secure">HealthBox Secure (18-24% p.a.)</option>
                            <option value="HealthBox Core">HealthBox Core (30-36% p.a.)</option>
                            <option value="HealthBox Elite">HealthBox Elite (42-48% p.a.)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Investitionssumme (€)</label>
                        <input type="number" id="calcAmount" placeholder="25000" min="10000" 
                               oninput="calculatorModule.calculate()">
                    </div>

                    <div class="form-group">
                        <label>Ihre Provision (%)</label>
                        <input type="number" id="calcCommission" value="10" min="0" max="100" step="0.5"
                               oninput="calculatorModule.calculate()">
                    </div>

                    <div class="form-group">
                        <label>Team-Provision (%) - Nur für Teamleader</label>
                        <input type="number" id="calcTeamCommission" value="5" min="0" max="100" step="0.5"
                               oninput="calculatorModule.calculate()">
                    </div>

                    <button class="btn btn-primary" onclick="calculatorModule.calculate()">
                        <i class="fas fa-calculator"></i> Berechnen
                    </button>
                </div>

                <!-- Ergebnis -->
                <div id="calcResult"></div>

                <!-- Zielerreichungs-Rechner -->
                <div style="background: var(--gray-50); padding: 24px; border-radius: 12px; margin-top: 30px;">
                    <h3>🎯 Zielerreichungs-Rechner</h3>
                    <p style="color: var(--gray-600); margin-bottom: 20px;">
                        Berechnen Sie, wie viele Abschlüsse Sie für Ihr Wunsch-Einkommen benötigen
                    </p>

                    <div class="form-group">
                        <label>Gewünschtes Monatseinkommen (€)</label>
                        <input type="number" id="targetIncome" placeholder="5000" min="1000" step="500"
                               oninput="calculatorModule.calculateTarget()">
                    </div>

                    <div class="form-group">
                        <label>Durchschnittliche Investitionssumme (€)</label>
                        <input type="number" id="avgDeal" value="25000" min="10000" step="5000"
                               oninput="calculatorModule.calculateTarget()">
                    </div>

                    <div class="form-group">
                        <label>Durchschnittliche Provision (%)</label>
                        <input type="number" id="avgCommission" value="10" min="0" max="100" step="0.5"
                               oninput="calculatorModule.calculateTarget()">
                    </div>

                    <button class="btn btn-success" onclick="calculatorModule.calculateTarget()">
                        <i class="fas fa-bullseye"></i> Ziel berechnen
                    </button>

                    <div id="targetResult"></div>
                </div>
            </div>
        `;
    },

    renderProductTable() {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Produkt</th>
                        <th>Investition</th>
                        <th>Quartal (%)</th>
                        <th>Jahr (%)</th>
                        <th>Versicherung</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="3"><strong>HealthBox Secure</strong></td>
                        <td>10.000 €</td>
                        <td>3%</td>
                        <td><strong>18%</strong></td>
                        <td rowspan="3">✅ Versichert</td>
                    </tr>
                    <tr>
                        <td>25.000 €</td>
                        <td>3,75%</td>
                        <td><strong>21%</strong></td>
                    </tr>
                    <tr>
                        <td>≥ 100.000 €</td>
                        <td>4,5%</td>
                        <td><strong>24%</strong></td>
                    </tr>
                    
                    <tr>
                        <td rowspan="3"><strong>HealthBox Core</strong></td>
                        <td>10.000 €</td>
                        <td>6%</td>
                        <td><strong>30%</strong></td>
                        <td rowspan="3">⚠️ 50% versichert</td>
                    </tr>
                    <tr>
                        <td>25.000 €</td>
                        <td>6,75%</td>
                        <td><strong>33%</strong></td>
                    </tr>
                    <tr>
                        <td>≥ 100.000 €</td>
                        <td>7,5%</td>
                        <td><strong>36%</strong></td>
                    </tr>
                    
                    <tr>
                        <td rowspan="3"><strong>HealthBox Elite</strong></td>
                        <td>25.000 €</td>
                        <td>9%</td>
                        <td><strong>42%</strong></td>
                        <td rowspan="3">❌ Unversichert</td>
                    </tr>
                    <tr>
                        <td>200.000 €</td>
                        <td>9,75%</td>
                        <td><strong>45%</strong></td>
                    </tr>
                    <tr>
                        <td>≥ 500.000 €</td>
                        <td>10,5%</td>
                        <td><strong>48%</strong></td>
                    </tr>
                </tbody>
            </table>
        `;
    },

    calculate() {
        const product = document.getElementById('calcProduct').value;
        const amount = parseFloat(document.getElementById('calcAmount').value);
        const commission = parseFloat(document.getElementById('calcCommission').value);
        const teamCommission = parseFloat(document.getElementById('calcTeamCommission').value);

        if (!product || !amount) {
            document.getElementById('calcResult').innerHTML = '';
            return;
        }

        const returns = calculateReturns(amount, product);
        if (!returns) {
            document.getElementById('calcResult').innerHTML = 
                '<p style="color: var(--danger-red);">Ungültige Investitionssumme für dieses Produkt</p>';
            return;
        }

        const ownCommission = calculateCommission(amount, commission);
        const teamCom = calculateCommission(amount, teamCommission);

        document.getElementById('calcResult').innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid var(--success-green);">
                <h3 style="color: var(--success-green); margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i> Berechnungsergebnis
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 14px; color: var(--gray-600); margin-bottom: 4px;">Investitionssumme</div>
                        <div style="font-size: 24px; font-weight: 700;">${formatCurrency(amount)}</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; color: var(--gray-600); margin-bottom: 4px;">Produkt</div>
                        <div style="font-size: 18px; font-weight: 600;">${product}</div>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--gray-200); padding-top: 20px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 16px;">Kundenrenditen</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--gray-600); margin-bottom: 4px;">Quartalsrendite</div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--primary-blue);">
                                ${formatCurrency(returns.quarterlyReturn)} (${returns.quarterlyRate}%)
                            </div>
                        </div>
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--gray-600); margin-bottom: 4px;">Jahresrendite</div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--success-green);">
                                ${formatCurrency(returns.annualReturn)} (${returns.annualRate}%)
                            </div>
                        </div>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--gray-200); padding-top: 20px;">
                    <h4 style="margin-bottom: 16px;">Ihre Provisionen</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div style="background: linear-gradient(135deg, var(--primary-gold) 0%, #e5c158 100%); 
                                    padding: 16px; border-radius: 8px; color: white;">
                            <div style="font-size: 12px; margin-bottom: 4px; opacity: 0.9;">Ihre Provision (${commission}%)</div>
                            <div style="font-size: 24px; font-weight: 700;">
                                ${formatCurrency(ownCommission)}
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%); 
                                    padding: 16px; border-radius: 8px; color: white;">
                            <div style="font-size: 12px; margin-bottom: 4px; opacity: 0.9;">Team-Provision (${teamCommission}%)</div>
                            <div style="font-size: 24px; font-weight: 700;">
                                ${formatCurrency(teamCom)}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; padding: 16px; background: var(--gray-50); border-radius: 8px;">
                        <div style="font-size: 14px; color: var(--gray-600); margin-bottom: 4px;">Gesamt-Provision</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--success-green);">
                            ${formatCurrency(ownCommission + teamCom)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        authApp.logActivity('calculator', `Berechnung durchgeführt: ${product}, ${formatCurrency(amount)}`);
    },

    calculateTarget() {
        const targetIncome = parseFloat(document.getElementById('targetIncome').value);
        const avgDeal = parseFloat(document.getElementById('avgDeal').value);
        const avgCommission = parseFloat(document.getElementById('avgCommission').value);

        if (!targetIncome || !avgDeal || !avgCommission) {
            document.getElementById('targetResult').innerHTML = '';
            return;
        }

        const commissionPerDeal = calculateCommission(avgDeal, avgCommission);
        const dealsNeeded = Math.ceil(targetIncome / commissionPerDeal);
        const dealsPerWeek = (dealsNeeded / 4).toFixed(1);

        document.getElementById('targetResult').innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 12px; margin-top: 20px; 
                        border: 2px solid var(--primary-blue);">
                <h3 style="color: var(--primary-blue); margin-bottom: 20px;">
                    <i class="fas fa-bullseye"></i> Ihr Weg zum Ziel
                </h3>
                
                <div style="background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%); 
                            padding: 24px; border-radius: 12px; color: white; margin-bottom: 20px;">
                    <div style="font-size: 14px; margin-bottom: 8px; opacity: 0.9;">
                        Um ${formatCurrency(targetIncome)} pro Monat zu verdienen, benötigen Sie:
                    </div>
                    <div style="font-size: 48px; font-weight: 700; margin-bottom: 4px;">
                        ${dealsNeeded}
                    </div>
                    <div style="font-size: 18px; opacity: 0.9;">
                        Abschlüsse pro Monat
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-600); margin-bottom: 8px;">Pro Woche</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-blue);">
                            ~${dealsPerWeek}
                        </div>
                        <div style="font-size: 12px; color: var(--gray-600);">Abschlüsse</div>
                    </div>
                    
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-600); margin-bottom: 8px;">Ø Provision</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-gold);">
                            ${formatCurrency(commissionPerDeal)}
                        </div>
                        <div style="font-size: 12px; color: var(--gray-600);">pro Deal</div>
                    </div>
                    
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-600); margin-bottom: 8px;">Gesamtumsatz</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--success-green);">
                            ${formatCurrency(dealsNeeded * avgDeal)}
                        </div>
                        <div style="font-size: 12px; color: var(--gray-600);">pro Monat</div>
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 16px; background: var(--accent-cyan); background: rgba(0, 212, 255, 0.1); 
                            border-radius: 8px; border-left: 4px solid var(--accent-cyan);">
                    <strong>💡 Tipp:</strong> Mit einem Team können Sie dieses Ziel schneller erreichen! 
                    Jedes Team-Mitglied trägt zu Ihrer Team-Provision bei.
                </div>
            </div>
        `;

        authApp.logActivity('calculator', `Zielerreichung berechnet: ${formatCurrency(targetIncome)}/Monat`);
    }
};
