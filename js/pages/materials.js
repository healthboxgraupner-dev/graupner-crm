// ===================================
// Sales Materials Page
// ===================================

const materialsPage = {
    render() {
        const isAdmin = authApp.isAdmin();
        
        return `
            <div class="page-header">
                <h1><i class="fas fa-folder-open"></i> Vertriebsunterlagen</h1>
                <p>Dokumente, Präsentationen und Marketing-Materialien</p>
            </div>

            ${isAdmin ? `
            <div class="page-actions">
                <button class="btn btn-primary" onclick="materialsPage.uploadMaterial()">
                    <i class="fas fa-upload"></i> Material hochladen
                </button>
                <button class="btn btn-gold" onclick="materialsPage.broadcastMessage()">
                    <i class="fas fa-bullhorn"></i> Mitteilung an alle Partner
                </button>
            </div>
            ` : ''}

            <div id="materialsGrid"></div>
        `;
    },

    init() {
        this.loadMaterials();
    },

    loadMaterials() {
        const materials = db.get('materials') || this.getDefaultMaterials();
        const container = document.getElementById('materialsGrid');

        if (materials.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-folder-open" style="font-size: 64px; color: var(--grey-light); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--grey-medium);">Noch keine Unterlagen vorhanden</h3>
                        <p class="text-muted">Ihr Administrator wird bald Vertriebsunterlagen bereitstellen.</p>
                    </div>
                </div>
            `;
            return;
        }

        const categorized = this.categorizeMaterials(materials);
        let html = '';

        for (const [category, items] of Object.entries(categorized)) {
            html += `
                <div class="card">
                    <div class="card-header">
                        <h2><i class="${this.getCategoryIcon(category)}"></i> ${category}</h2>
                    </div>
                    <div class="materials-list">
                        ${items.map(material => this.renderMaterial(material)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    renderMaterial(material) {
        const isAdmin = authApp.isAdmin();
        const fileIcon = this.getFileIcon(material.type);
        const fileSize = material.size ? `(${this.formatFileSize(material.size)})` : '';

        return `
            <div class="material-item" data-id="${material.id}">
                <div class="material-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="material-info">
                    <h3>${material.name}</h3>
                    <p class="text-muted">${material.description}</p>
                    <small class="text-muted">
                        <i class="fas fa-calendar"></i> ${utils.formatDate(material.uploadedAt)}
                        ${fileSize}
                    </small>
                </div>
                <div class="material-actions">
                    ${material.url ? `
                        <button class="btn btn-primary btn-sm" onclick="materialsPage.downloadMaterial('${material.id}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm" onclick="materialsPage.viewMaterial('${material.id}')">
                            <i class="fas fa-eye"></i> Ansehen
                        </button>
                    `}
                    ${isAdmin ? `
                        <button class="btn-icon btn-danger" onclick="materialsPage.deleteMaterial('${material.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    categorizeMaterials(materials) {
        const categorized = {};
        materials.forEach(material => {
            const category = material.category || 'Allgemein';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(material);
        });
        return categorized;
    },

    getDefaultMaterials() {
        return [
            // Produktinformationen
            {
                id: utils.generateId(),
                name: 'HealthBox Produktübersicht',
                description: 'Vollständige Übersicht aller HealthBox-Produkte und Leistungen',
                category: 'Produktinformationen',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Produktübersicht: HealthBox Secure, Core und Elite\n\nHealthBox Secure: Basis-Investment ab 10.000€\nHealthBox Core: Premium-Investment ab 10.000€\nHealthBox Elite: VIP-Investment ab 100.000€'
            },
            {
                id: utils.generateId(),
                name: 'HealthBox Produktbroschüre',
                description: 'Detaillierte Broschüre mit allen Produktfeatures und Benefits',
                category: 'Produktinformationen',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Hochwertige Produktbroschüre für Kundengespräche\nEnthält: Features, Benefits, Testimonials, Preismodelle'
            },
            
            // Sales Training
            {
                id: utils.generateId(),
                name: 'Verkaufsleitfaden',
                description: 'Schritt-für-Schritt Anleitung für erfolgreiche Verkaufsgespräche',
                category: 'Sales Training',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Verkaufsleitfaden:\n1. Beziehungsaufbau\n2. Bedarfsanalyse\n3. Produktpräsentation\n4. Einwandbehandlung\n5. Abschluss'
            },
            {
                id: utils.generateId(),
                name: 'Verkaufstraining Präsentation',
                description: 'PowerPoint-Präsentation für interne Verkaufsschulungen',
                category: 'Sales Training',
                type: 'pptx',
                uploadedAt: Date.now(),
                content: 'Verkaufstraining-Deck:\n- Sales Techniques\n- Objection Handling\n- Closing Strategies\n- Best Practices'
            },
            {
                id: utils.generateId(),
                name: 'Einwandbehandlung Cheat Sheet',
                description: 'Schnellreferenz für häufige Kundeneinwände und passende Antworten',
                category: 'Sales Training',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Häufige Einwände:\n\n"Zu teuer" → Value-Fokus\n"Muss überlegen" → Trial Close\n"Kein Interesse" → Benefit-Reframing'
            },
            
            // Verkaufsunterlagen für den Abschluss
            {
                id: utils.generateId(),
                name: 'KYC Formular (Know Your Customer)',
                description: 'Pflichtformular zur Kundenidentifikation und -prüfung',
                category: 'Verkaufsunterlagen für den Abschluss',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'KYC-Formular enthält:\n- Persönliche Daten\n- Ausweisdokumente\n- Vermögensnachweise\n- Herkunft der Mittel'
            },
            {
                id: utils.generateId(),
                name: 'Investmentvertrag HealthBox',
                description: 'Standardvertrag für HealthBox Investments',
                category: 'Verkaufsunterlagen für den Abschluss',
                type: 'docx',
                uploadedAt: Date.now(),
                content: 'Rechtlich geprüfter Investmentvertrag\nEnthält: Konditionen, Laufzeiten, Kündigungsfristen, Renditen'
            },
            {
                id: utils.generateId(),
                name: 'Datenschutzerklärung & Einwilligung',
                description: 'DSGVO-konforme Einwilligungserklärung',
                category: 'Verkaufsunterlagen für den Abschluss',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Datenschutz-Dokumente gemäß DSGVO\nMuss vom Kunden unterschrieben werden'
            },
            
            // Verkaufsunterlagen für den Kunden
            {
                id: utils.generateId(),
                name: 'HealthBox Kundenpräsentation',
                description: 'Professionelle PowerPoint für Kundentermine',
                category: 'Verkaufsunterlagen für den Kunden',
                type: 'pptx',
                uploadedAt: Date.now(),
                content: 'Kundenpräsentation mit:\n- Unternehmensvorstellung\n- Produktdetails\n- Investment-Optionen\n- ROI-Beispiele'
            },
            {
                id: utils.generateId(),
                name: 'FAQ für Kunden',
                description: 'Häufig gestellte Fragen und Antworten für Interessenten',
                category: 'Verkaufsunterlagen für den Kunden',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Kunden-FAQ:\n- Wie funktioniert HealthBox?\n- Welche Renditen sind möglich?\n- Wie sicher ist mein Investment?\n- Wie läuft der Abschluss?'
            },
            {
                id: utils.generateId(),
                name: 'Produktvergleich',
                description: 'Übersichtliche Vergleichstabelle aller HealthBox Produkte',
                category: 'Verkaufsunterlagen für den Kunden',
                type: 'pdf',
                uploadedAt: Date.now(),
                content: 'Side-by-Side Vergleich:\nSecure vs Core vs Elite\nFeatures, Preise, Laufzeiten, Renditen'
            }
        ];
    },

    uploadMaterial() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-upload"></i> Material hochladen</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="uploadMaterialForm">
                        <div class="form-group">
                            <label for="materialName"><i class="fas fa-file"></i> Name</label>
                            <input type="text" id="materialName" required>
                        </div>
                        <div class="form-group">
                            <label for="materialDescription"><i class="fas fa-info-circle"></i> Beschreibung</label>
                            <textarea id="materialDescription" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="materialCategory"><i class="fas fa-folder"></i> Kategorie</label>
                            <select id="materialCategory" required>
                                <option value="Produktinformationen">Produktinformationen</option>
                                <option value="Sales Training">Sales Training</option>
                                <option value="Verkaufsunterlagen für den Abschluss">Verkaufsunterlagen für den Abschluss</option>
                                <option value="Verkaufsunterlagen für den Kunden">Verkaufsunterlagen für den Kunden</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Allgemein">Allgemein</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="materialFile"><i class="fas fa-paperclip"></i> Datei oder URL</label>
                            <input type="file" id="materialFile">
                            <small class="text-muted">Oder geben Sie eine URL ein:</small>
                            <input type="url" id="materialUrl" placeholder="https://..." style="margin-top: 10px;">
                        </div>
                        <div class="info-text">
                            <i class="fas fa-info-circle"></i> Hinweis: Aufgrund von Browser-Einschränkungen werden Dateien als Base64 gespeichert. Für große Dateien (>5MB) empfehlen wir die Verwendung von URLs (z.B. Dropbox, Google Drive).
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Abbrechen
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('uploadMaterialForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const file = document.getElementById('materialFile').files[0];
            const url = document.getElementById('materialUrl').value;

            if (!file && !url) {
                utils.showToast('Bitte Datei oder URL angeben', 'error');
                return;
            }

            const material = {
                id: utils.generateId(),
                name: document.getElementById('materialName').value,
                description: document.getElementById('materialDescription').value,
                category: document.getElementById('materialCategory').value,
                uploadedAt: Date.now(),
                uploadedBy: authApp.currentUser.name
            };

            if (url) {
                material.url = url;
                material.type = this.getFileTypeFromUrl(url);
            } else if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    utils.showToast('Datei zu groß! Maximum 5MB. Bitte URL verwenden.', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    material.content = e.target.result;
                    material.type = file.type.split('/')[1] || 'file';
                    material.size = file.size;
                    
                    this.saveMaterial(material);
                    modal.remove();
                };
                reader.readAsDataURL(file);
                return;
            }

            this.saveMaterial(material);
            modal.remove();
        });
    },

    saveMaterial(material) {
        const materials = db.get('materials') || this.getDefaultMaterials();
        materials.push(material);
        db.set('materials', materials);
        
        utils.showToast('Material erfolgreich hochgeladen!', 'success');
        this.loadMaterials();
    },

    downloadMaterial(id) {
        const materials = db.get('materials') || this.getDefaultMaterials();
        const material = materials.find(m => m.id === id);
        
        if (!material) return;

        if (material.url) {
            window.open(material.url, '_blank');
        } else if (material.content && material.content.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = material.content;
            link.download = material.name;
            link.click();
        } else {
            this.viewMaterial(id);
        }
    },

    viewMaterial(id) {
        const materials = db.get('materials') || this.getDefaultMaterials();
        const material = materials.find(m => m.id === id);
        
        if (!material) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file"></i> ${material.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Beschreibung:</strong> ${material.description}</p>
                    <p><strong>Kategorie:</strong> ${material.category}</p>
                    <hr>
                    <div style="white-space: pre-wrap; background: var(--grey-lighter); padding: 20px; border-radius: 8px;">
                        ${material.content || 'Keine Vorschau verfügbar'}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    deleteMaterial(id) {
        if (!utils.confirm('Material wirklich löschen?')) return;

        const materials = db.get('materials') || [];
        const filtered = materials.filter(m => m.id !== id);
        db.set('materials', filtered);
        
        utils.showToast('Material gelöscht', 'success');
        this.loadMaterials();
    },

    broadcastMessage() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bullhorn"></i> Mitteilung an alle Partner</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="broadcastForm">
                        <div class="form-group">
                            <label for="broadcastTitle"><i class="fas fa-heading"></i> Betreff</label>
                            <input type="text" id="broadcastTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="broadcastMessage"><i class="fas fa-message"></i> Nachricht</label>
                            <textarea id="broadcastMessage" rows="6" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="broadcastPriority"><i class="fas fa-exclamation-circle"></i> Priorität</label>
                            <select id="broadcastPriority">
                                <option value="info">ℹ️ Information</option>
                                <option value="important">⚠️ Wichtig</option>
                                <option value="urgent">🚨 Dringend</option>
                            </select>
                        </div>
                        <div class="info-text">
                            <i class="fas fa-users"></i> Diese Nachricht wird an alle ${db.getUsers().filter(u => u.role !== 'admin').length} Partner gesendet.
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Abbrechen
                            </button>
                            <button type="submit" class="btn btn-gold">
                                <i class="fas fa-paper-plane"></i> Jetzt senden
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('broadcastForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendBroadcast();
            modal.remove();
        });
    },

    sendBroadcast() {
        const title = document.getElementById('broadcastTitle').value;
        const message = document.getElementById('broadcastMessage').value;
        const priority = document.getElementById('broadcastPriority').value;

        const users = db.getUsers().filter(u => u.role !== 'admin');
        const notifications = db.getNotifications();

        users.forEach(user => {
            notifications.push({
                id: utils.generateId(),
                userId: user.id,
                type: priority,
                message: `${title}: ${message}`,
                date: utils.getTodayString(),
                read: false,
                broadcast: true,
                from: authApp.currentUser.name
            });
        });

        db.setNotifications(notifications);
        
        utils.showToast(`Mitteilung an ${users.length} Partner versendet!`, 'success');
    },

    getCategoryIcon(category) {
        const icons = {
            'Produktinformationen': 'fas fa-box',
            'Sales Training': 'fas fa-graduation-cap',
            'Verkaufsunterlagen für den Abschluss': 'fas fa-file-signature',
            'Verkaufsunterlagen für den Kunden': 'fas fa-handshake',
            'Marketing': 'fas fa-bullhorn',
            'Allgemein': 'fas fa-folder'
        };
        return icons[category] || 'fas fa-folder';
    },

    getFileIcon(type) {
        const icons = {
            'pdf': 'fas fa-file-pdf text-danger',
            'doc': 'fas fa-file-word text-primary',
            'docx': 'fas fa-file-word text-primary',
            'xls': 'fas fa-file-excel text-success',
            'xlsx': 'fas fa-file-excel text-success',
            'ppt': 'fas fa-file-powerpoint text-warning',
            'pptx': 'fas fa-file-powerpoint text-warning',
            'zip': 'fas fa-file-archive',
            'jpg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'mp4': 'fas fa-file-video',
        };
        return icons[type] || 'fas fa-file';
    },

    getFileTypeFromUrl(url) {
        const extension = url.split('.').pop().split('?')[0].toLowerCase();
        return extension;
    },

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
};
