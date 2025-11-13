// ===================================
// Export Functions (Excel & PDF)
// ===================================

const exportData = {
    // Export to Excel
    exportToExcel(data, filename, sheetName = 'Daten') {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `${filename}_${utils.formatDate(new Date())}.xlsx`);
            utils.showToast('Excel-Export erfolgreich', 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            utils.showToast('Fehler beim Excel-Export', 'error');
        }
    },

    // Export to PDF
    exportToPDF(title, headers, data, filename) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4');

            // Add HEALTHBOX branding
            doc.setFillColor(30, 58, 138); // Primary blue
            doc.rect(0, 0, 297, 20, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('HEALTHBOX - Sales CRM', 10, 12);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(title, 10, 30);

            // Add date
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Erstellt am: ${utils.formatDate(new Date())}`, 10, 38);

            // Prepare table data
            const tableData = data.map(row => 
                headers.map(header => row[header.field] || '')
            );

            // Add table
            doc.autoTable({
                startY: 45,
                head: [headers.map(h => h.label)],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [30, 58, 138],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [243, 244, 246]
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                }
            });

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(107, 114, 128);
                doc.text(
                    `Seite ${i} von ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            doc.save(`${filename}_${utils.formatDate(new Date())}.pdf`);
            utils.showToast('PDF-Export erfolgreich', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            utils.showToast('Fehler beim PDF-Export', 'error');
        }
    },

    // Export leads to Excel
    exportLeads(userId = null) {
        const leads = userId ? db.getLeads(userId) : db.getLeads();
        const exportData = leads.map(lead => ({
            'Datum': utils.formatDate(lead.date),
            'Kontakt': lead.contactName,
            'Quelle': lead.source,
            'Status': utils.getStatusLabel(lead.status),
            'Nächster Schritt': lead.nextStep,
            'Follow-up': utils.formatDate(lead.followupDate),
            'Notizen': lead.notes
        }));
        this.exportToExcel(exportData, 'Leads', 'Lead-Übersicht');
    },

    // Export leads to PDF
    exportLeadsToPDF(userId = null) {
        const leads = userId ? db.getLeads(userId) : db.getLeads();
        const headers = [
            { label: 'Datum', field: 'date' },
            { label: 'Kontakt', field: 'contactName' },
            { label: 'Quelle', field: 'source' },
            { label: 'Status', field: 'statusLabel' },
            { label: 'Nächster Schritt', field: 'nextStep' }
        ];
        const data = leads.map(lead => ({
            ...lead,
            date: utils.formatDate(lead.date),
            statusLabel: utils.getStatusLabel(lead.status)
        }));
        this.exportToPDF('Lead-Übersicht', headers, data, 'Leads');
    },

    // Export calls to Excel
    exportCalls(userId = null) {
        const calls = userId ? db.getCalls(userId) : db.getCalls();
        const exportData = calls.map(call => ({
            'Datum': utils.formatDate(call.date),
            'Gesprächspartner': call.partner,
            'Dauer': call.duration,
            'Thema': call.topic,
            'Ergebnis': call.result,
            'Nächste Aktion': call.nextAction,
            'Bemerkung': call.notes
        }));
        this.exportToExcel(exportData, 'Gespraeche', 'Gesprächs-Tracking');
    },

    // Export follow-ups to Excel
    exportFollowups(userId = null) {
        const followups = userId ? db.getFollowups(userId) : db.getFollowups();
        const exportData = followups.map(f => ({
            'Kontakt': f.contact,
            'Letzter Kontakt': utils.formatDate(f.lastContact),
            'Nächster Kontakt': utils.formatDate(f.nextContact),
            'Kanal': f.channel,
            'Reminder': f.reminder ? 'Ja' : 'Nein',
            'Kommentar': f.comment
        }));
        this.exportToExcel(exportData, 'Follow-ups', 'Follow-up-Plan');
    },

    // Export monthly data to Excel
    exportMonthlyData(userId = null) {
        const monthlyData = userId ? db.getMonthlyData(userId) : db.getMonthlyData();
        const exportData = monthlyData.map(m => ({
            'Monat': utils.getMonthName(m.month),
            'Jahr': m.year,
            'Neue Leads': m.newLeads,
            'Gespräche': m.calls,
            'Abschlüsse': m.closedDeals,
            'Umsatz': utils.formatCurrency(m.revenue),
            'Conversion': utils.formatPercentage(utils.calculateConversion(m.closedDeals, m.calls))
        }));
        this.exportToExcel(exportData, 'Monatsuebersicht', 'Monatsübersicht');
    },

    // Export performance comparison
    exportPerformanceComparison() {
        const users = authApp.getAccessibleUsers().filter(u => u.role !== 'admin');
        const data = users.map(user => {
            const leads = db.getLeads(user.id);
            const calls = db.getCalls(user.id);
            const monthlyData = db.getMonthlyData(user.id);
            
            const totalLeads = leads.length;
            const totalCalls = calls.length;
            const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0);
            const totalDeals = monthlyData.reduce((sum, m) => sum + (m.closedDeals || 0), 0);
            const conversion = utils.calculateConversion(totalDeals, totalCalls);

            return {
                'Name': user.name,
                'Rolle': user.role === 'teamleader' ? 'Team-Leader' : 'Partner',
                'Status': utils.getStatusLabel(user.status),
                'Leads': totalLeads,
                'Gespräche': totalCalls,
                'Abschlüsse': totalDeals,
                'Umsatz': utils.formatCurrency(totalRevenue),
                'Conversion': utils.formatPercentage(conversion)
            };
        });

        this.exportToExcel(data, 'Performance-Vergleich', 'Performance');
    }
};
