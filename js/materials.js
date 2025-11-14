// Materials Module
const materialsModule = {
    currentTab: 'kunden',
    
    render(container) {
        const isAdmin = authApp.currentUser.role === 'admin';
        const materials = this.getMaterials();
        
        container.innerHTML = `
            <div class="card">
                ${isAdmin ? `
                    <div class="card-header">
                        <h2>Materialien & Ressourcen</h2>
                        <button class="btn btn-primary" onclick="materialsModule.showUploadForm()">
                            <i class="fas fa-upload"></i> Material hochladen
                        </button>
                    </div>
                ` : '<h2>Materialien & Ressourcen</h2>'}
                
                <div class="tabs">
                    <button class="tab ${this.currentTab === 'kunden' ? 'active' : ''}" onclick="materialsModule.switchTab('kunden')">
                        Kundenunterlagen
                    </button>
                    <button class="tab ${this.currentTab === 'marketing' ? 'active' : ''}" onclick="materialsModule.switchTab('marketing')">
                        Marketing-Material
                    </button>
                    <button class="tab ${this.currentTab === 'training' ? 'active' : ''}" onclick="materialsModule.switchTab('training')">
                        Sales Training
                    </button>
                </div>
                
                <div style="margin-top: 20px;">
                    <input type="text" id="materialSearch" placeholder="Materialien durchsuchen..." 
                           style="width: 100%; padding: 12px; border: 1px solid var(--gray-300); border-radius: 8px;"
                           oninput="materialsModule.search()">
                </div>

                <div id="materialsContent" style="margin-top: 20px;"></div>
            </div>
        `;
        this.renderMaterials();
    },

    getMaterials() {
        // Versuche aus LocalStorage zu laden, sonst Default-Daten
        const stored = localStorage.getItem('crm_materials');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default Demo-Materialien
        const defaultMaterials = {
            kunden: [
                { id: 'm1', name: 'KYC-Formular', type: 'PDF', size: '245 KB', date: Date.now(), url: '#' },
                { id: 'm2', name: 'Vertrag HealthBox Secure', type: 'PDF', size: '189 KB', date: Date.now(), url: '#' },
                { id: 'm3', name: 'Vertrag HealthBox Core', type: 'PDF', size: '192 KB', date: Date.now(), url: '#' },
                { id: 'm4', name: 'Vertrag HealthBox Elite', type: 'PDF', size: '195 KB', date: Date.now(), url: '#' },
                { id: 'm5', name: 'Performance-Tabellen', type: 'Excel', size: '45 KB', date: Date.now(), url: '#' },
                { id: 'm6', name: 'Produktübersicht', type: 'PDF', size: '1.2 MB', date: Date.now(), url: '#' }
            ],
            marketing: [
                { id: 'm7', name: 'HealthBox Flyer', type: 'PDF', size: '2.5 MB', date: Date.now(), url: '#' },
                { id: 'm8', name: 'Longevity Capital Präsentation', type: 'PPTX', size: '8.7 MB', date: Date.now(), url: '#' },
                { id: 'm9', name: 'Whitepaper Gesundheit als Investment', type: 'PDF', size: '3.2 MB', date: Date.now(), url: '#' },
                { id: 'm10', name: 'Social Media Grafiken', type: 'ZIP', size: '15 MB', date: Date.now(), url: '#' },
                { id: 'm11', name: 'Logo-Paket', type: 'ZIP', size: '5.2 MB', date: Date.now(), url: '#' }
            ],
            training: [
                { id: 'm12', name: 'Verkaufsleitfaden - Umgang mit Kunden', type: 'PDF', size: '890 KB', date: Date.now(), url: '#' },
                { id: 'm13', name: 'Gesprächsführung Best Practices', type: 'PDF', size: '456 KB', date: Date.now(), url: '#' },
                { id: 'm14', name: 'Einwandbehandlung', type: 'PDF', size: '378 KB', date: Date.now(), url: '#' },
                { id: 'm15', name: 'Abschlusstechniken', type: 'PDF', size: '512 KB', date: Date.now(), url: '#' },
                { id: 'm16', name: 'Video-Training Links', type: 'TXT', size: '2 KB', date: Date.now(), url: '#' }
            ]
        };
        
        this.saveMaterials(defaultMaterials);
        return defaultMaterials;
    },

    saveMaterials(materials) {
        localStorage.setItem('crm_materials', JSON.stringify(materials));
    },

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab styling
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        this.renderMaterials();
    },

    renderMaterials() {
        const container = document.getElementById('materialsContent');
        if (!container) return;

        const materials = this.getMaterials();
        const currentMaterials = materials[this.currentTab] || [];
        const isAdmin = authApp.currentUser.role === 'admin';
        
        if (currentMaterials.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 40px;">Noch keine Materialien in dieser Kategorie</p>';
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Typ</th>
                        <th>Größe</th>
                        <th>Datum</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentMaterials.map(m => `
                        <tr>
                            <td><i class="fas fa-file-${this.getFileIcon(m.type)}"></i> ${m.name}</td>
                            <td>${m.type}</td>
                            <td>${m.size}</td>
                            <td>${formatDate(m.date)}</td>
                            <td>
                                <button class="btn btn-primary" onclick="materialsModule.download('${m.name}', '${m.url}')" style="margin-right: 8px;">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                ${isAdmin ? `
                                    <button class="btn btn-danger" onclick="materialsModule.deleteMaterial('${m.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    showUploadForm() {
        document.body.insertAdjacentHTML('beforeend', `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;"
                     onclick="event.stopPropagation()">
                    <h2>Material hochladen</h2>
                    <form onsubmit="materialsModule.upload(event)">
                        <div class="form-group">
                            <label>Kategorie *</label>
                            <select id="uploadCategory" required>
                                <option value="kunden">Kundenunterlagen</option>
                                <option value="marketing">Marketing-Material</option>
                                <option value="training">Sales Training</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Dateiname *</label>
                            <input type="text" id="uploadName" required placeholder="z.B. Verkaufsleitfaden 2024">
                        </div>
                        
                        <div class="form-group">
                            <label>Dateityp *</label>
                            <select id="uploadType" required>
                                <option value="PDF">PDF</option>
                                <option value="Excel">Excel</option>
                                <option value="Word">Word</option>
                                <option value="PPTX">PowerPoint</option>
                                <option value="ZIP">ZIP</option>
                                <option value="TXT">Text</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Dateigröße</label>
                            <input type="text" id="uploadSize" placeholder="z.B. 2.5 MB">
                            <small>Optional - wird automatisch erkannt bei echtem Upload</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Datei-URL oder Datei hochladen *</label>
                            <input type="url" id="uploadUrl" placeholder="https://... oder Datei wählen">
                            <small>Geben Sie eine URL ein oder laden Sie eine Datei hoch</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Oder Datei auswählen</label>
                            <input type="file" id="uploadFile" onchange="materialsModule.handleFileSelect(event)">
                            <small>Max. 50 MB - Wird als Base64 gespeichert (nur für kleine Dateien empfohlen)</small>
                        </div>
                        
                        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <strong>💡 Hinweis:</strong><br>
                            • <strong>Empfohlen:</strong> Laden Sie große Dateien auf einen Cloud-Dienst (Google Drive, Dropbox) hoch und fügen Sie den Share-Link ein<br>
                            • <strong>Kleine Dateien:</strong> Können direkt hochgeladen werden (werden im Browser gespeichert)
                        </div>
                        
                        <button type="submit" class="btn btn-success">Material hinzufügen</button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);
    },

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Dateiname automatisch setzen
        const nameInput = document.getElementById('uploadName');
        if (!nameInput.value) {
            nameInput.value = file.name.replace(/\.[^/.]+$/, ''); // Ohne Dateiendung
        }

        // Dateigröße setzen
        const sizeInput = document.getElementById('uploadSize');
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        sizeInput.value = sizeInMB + ' MB';

        // Dateityp setzen
        const typeInput = document.getElementById('uploadType');
        const extension = file.name.split('.').pop().toUpperCase();
        if (extension === 'XLSX' || extension === 'XLS') {
            typeInput.value = 'Excel';
        } else if (extension === 'DOCX' || extension === 'DOC') {
            typeInput.value = 'Word';
        } else if (extension === 'PPTX' || extension === 'PPT') {
            typeInput.value = 'PPTX';
        } else if (['PDF', 'ZIP', 'TXT'].includes(extension)) {
            typeInput.value = extension;
        }

        // Warnung bei großen Dateien
        if (file.size > 10 * 1024 * 1024) { // 10 MB
            alert('⚠️ Große Datei!\n\nDiese Datei ist größer als 10 MB.\n\nEmpfehlung:\n1. Laden Sie die Datei auf Google Drive oder Dropbox hoch\n2. Erstellen Sie einen Share-Link\n3. Fügen Sie den Link im URL-Feld ein\n\nSo bleibt Ihr CRM schnell und die Datei ist sicher gespeichert!');
        }

        // Datei als Base64 lesen (nur für kleine Dateien)
        if (file.size <= 10 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('uploadUrl').value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    upload(e) {
        e.preventDefault();
        
        const category = document.getElementById('uploadCategory').value;
        const name = document.getElementById('uploadName').value;
        const type = document.getElementById('uploadType').value;
        const size = document.getElementById('uploadSize').value || 'Unbekannt';
        const url = document.getElementById('uploadUrl').value;

        if (!url) {
            alert('Bitte geben Sie eine URL ein oder wählen Sie eine Datei aus!');
            return;
        }

        const materials = this.getMaterials();
        
        const newMaterial = {
            id: generateId('mat'),
            name: name,
            type: type,
            size: size,
            date: Date.now(),
            url: url
        };

        // Zur entsprechenden Kategorie hinzufügen
        if (!materials[category]) {
            materials[category] = [];
        }
        materials[category].push(newMaterial);

        this.saveMaterials(materials);
        showToast('success', `Material "${name}" erfolgreich hinzugefügt`);
        authApp.logActivity('material_uploaded', `Material hochgeladen: ${name} (${category})`);
        
        document.querySelector('div[style*="fixed"]').remove();
        
        // Zur richtigen Kategorie wechseln und neu rendern
        this.currentTab = category;
        app.navigateTo('materials');
    },

    deleteMaterial(id) {
        const materials = this.getMaterials();
        const category = this.currentTab;
        
        const material = materials[category].find(m => m.id === id);
        if (!material) return;

        if (confirm(`⚠️ Material "${material.name}" wirklich löschen?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
            materials[category] = materials[category].filter(m => m.id !== id);
            this.saveMaterials(materials);
            
            showToast('success', `Material "${material.name}" gelöscht`);
            authApp.logActivity('material_deleted', `Material gelöscht: ${material.name}`);
            
            this.renderMaterials();
        }
    },

    getFileIcon(type) {
        const icons = { 
            PDF: 'pdf', 
            Excel: 'excel', 
            Word: 'word',
            PPTX: 'powerpoint', 
            ZIP: 'archive', 
            TXT: 'alt' 
        };
        return icons[type] || 'file';
    },

    search() {
        const term = document.getElementById('materialSearch').value.toLowerCase();
        if (!term) {
            this.renderMaterials();
            return;
        }

        const materials = this.getMaterials();
        const currentMaterials = materials[this.currentTab] || [];
        const filtered = currentMaterials.filter(m => 
            m.name.toLowerCase().includes(term) || 
            m.type.toLowerCase().includes(term)
        );
        
        const container = document.getElementById('materialsContent');
        const isAdmin = authApp.currentUser.role === 'admin';
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 40px;">Keine Materialien gefunden</p>';
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Typ</th>
                        <th>Größe</th>
                        <th>Datum</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(m => `
                        <tr>
                            <td><i class="fas fa-file-${this.getFileIcon(m.type)}"></i> ${m.name}</td>
                            <td>${m.type}</td>
                            <td>${m.size}</td>
                            <td>${formatDate(m.date)}</td>
                            <td>
                                <button class="btn btn-primary" onclick="materialsModule.download('${m.name}', '${m.url}')" style="margin-right: 8px;">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                ${isAdmin ? `
                                    <button class="btn btn-danger" onclick="materialsModule.deleteMaterial('${m.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    download(name, url) {
        if (!url || url === '#') {
            showToast('warning', `"${name}" ist eine Demo-Datei. Bitte als Admin echte Datei hochladen.`);
            return;
        }

        // Wenn es eine Base64-Datei ist
        if (url.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('success', `"${name}" wird heruntergeladen...`);
        } else {
            // Externe URL - in neuem Tab öffnen
            window.open(url, '_blank');
            showToast('info', `"${name}" wird geöffnet...`);
        }
        
        authApp.logActivity('download', `Material heruntergeladen: ${name}`);
    }
};
