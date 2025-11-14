// Materials Module
const materialsModule = {
    currentTab: 'kunden',
    
    materials: {
        kunden: [
            { name: 'KYC-Formular', type: 'PDF', size: '245 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Secure', type: 'PDF', size: '189 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Core', type: 'PDF', size: '192 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Elite', type: 'PDF', size: '195 KB', date: '2024-11-01' },
            { name: 'Performance-Tabellen', type: 'Excel', size: '45 KB', date: '2024-10-15' },
            { name: 'Produktübersicht', type: 'PDF', size: '1.2 MB', date: '2024-10-20' }
        ],
        marketing: [
            { name: 'HealthBox Flyer', type: 'PDF', size: '2.5 MB', date: '2024-11-05' },
            { name: 'Longevity Capital Präsentation', type: 'PPTX', size: '8.7 MB', date: '2024-10-25' },
            { name: 'Whitepaper Gesundheit als Investment', type: 'PDF', size: '3.2 MB', date: '2024-10-15' },
            { name: 'Social Media Grafiken', type: 'ZIP', size: '15 MB', date: '2024-10-10' },
            { name: 'Logo-Paket', type: 'ZIP', size: '5.2 MB', date: '2024-10-01' }
        ],
        training: [
            { name: 'Verkaufsleitfaden - Umgang mit Kunden', type: 'PDF', size: '890 KB', date: '2024-10-28' },
            { name: 'Gesprächsführung Best Practices', type: 'PDF', size: '456 KB', date: '2024-10-20' },
            { name: 'Einwandbehandlung', type: 'PDF', size: '378 KB', date: '2024-10-15' },
            { name: 'Abschlusstechniken', type: 'PDF', size: '512 KB', date: '2024-10-10' },
            { name: 'Video-Training Links', type: 'TXT', size: '2 KB', date: '2024-10-05' }
        ]
    },

    render(container) {
        container.innerHTML = `
            <div class="card">
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

    switchTab(tab) {
        this.currentTab = tab;
        this.renderMaterials();
    },

    renderMaterials() {
        const container = document.getElementById('materialsContent');
        if (!container) return;

        const materials = this.materials[this.currentTab];
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Typ</th>
                        <th>Größe</th>
                        <th>Datum</th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(m => `
                        <tr>
                            <td><i class="fas fa-file-${this.getFileIcon(m.type)}"></i> ${m.name}</td>
                            <td>${m.type}</td>
                            <td>${m.size}</td>
                            <td>${m.date}</td>
                            <td><button class="btn btn-primary" onclick="materialsModule.download('${m.name}')">
                                <i class="fas fa-download"></i> Download
                            </button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    getFileIcon(type) {
        const icons = { PDF: 'pdf', Excel: 'excel', PPTX: 'powerpoint', ZIP: 'archive', TXT: 'alt' };
        return icons[type] || 'file';
    },

    search() {
        const term = document.getElementById('materialSearch').value.toLowerCase();
        const materials = this.materials[this.currentTab];
        const filtered = term ? materials.filter(m => m.name.toLowerCase().includes(term)) : materials;
        
        const container = document.getElementById('materialsContent');
        if (filtered.length === 0) {
            container.innerHTML = '<p>Keine Materialien gefunden</p>';
        } else {
            this.renderMaterials();
        }
    },

    download(name) {
        showToast('info', `Download von "${name}" gestartet...`);
        authApp.logActivity('download', `Material heruntergeladen: ${name}`);
    }
};
// Materials Module
const materialsModule = {
    currentTab: 'kunden',
    
    materials: {
        kunden: [
            { name: 'KYC-Formular', type: 'PDF', size: '245 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Secure', type: 'PDF', size: '189 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Core', type: 'PDF', size: '192 KB', date: '2024-11-01' },
            { name: 'Vertrag HealthBox Elite', type: 'PDF', size: '195 KB', date: '2024-11-01' },
            { name: 'Performance-Tabellen', type: 'Excel', size: '45 KB', date: '2024-10-15' },
            { name: 'Produktübersicht', type: 'PDF', size: '1.2 MB', date: '2024-10-20' }
        ],
        marketing: [
            { name: 'HealthBox Flyer', type: 'PDF', size: '2.5 MB', date: '2024-11-05' },
            { name: 'Longevity Capital Präsentation', type: 'PPTX', size: '8.7 MB', date: '2024-10-25' },
            { name: 'Whitepaper Gesundheit als Investment', type: 'PDF', size: '3.2 MB', date: '2024-10-15' },
            { name: 'Social Media Grafiken', type: 'ZIP', size: '15 MB', date: '2024-10-10' },
            { name: 'Logo-Paket', type: 'ZIP', size: '5.2 MB', date: '2024-10-01' }
        ],
        training: [
            { name: 'Verkaufsleitfaden - Umgang mit Kunden', type: 'PDF', size: '890 KB', date: '2024-10-28' },
            { name: 'Gesprächsführung Best Practices', type: 'PDF', size: '456 KB', date: '2024-10-20' },
            { name: 'Einwandbehandlung', type: 'PDF', size: '378 KB', date: '2024-10-15' },
            { name: 'Abschlusstechniken', type: 'PDF', size: '512 KB', date: '2024-10-10' },
            { name: 'Video-Training Links', type: 'TXT', size: '2 KB', date: '2024-10-05' }
        ]
    },

    render(container) {
        container.innerHTML = `
            <div class="card">
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

    switchTab(tab) {
        this.currentTab = tab;
        this.renderMaterials();
    },

    renderMaterials() {
        const container = document.getElementById('materialsContent');
        if (!container) return;

        const materials = this.materials[this.currentTab];
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Typ</th>
                        <th>Größe</th>
                        <th>Datum</th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(m => `
                        <tr>
                            <td><i class="fas fa-file-${this.getFileIcon(m.type)}"></i> ${m.name}</td>
                            <td>${m.type}</td>
                            <td>${m.size}</td>
                            <td>${m.date}</td>
                            <td><button class="btn btn-primary" onclick="materialsModule.download('${m.name}')">
                                <i class="fas fa-download"></i> Download
                            </button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    getFileIcon(type) {
        const icons = { PDF: 'pdf', Excel: 'excel', PPTX: 'powerpoint', ZIP: 'archive', TXT: 'alt' };
        return icons[type] || 'file';
    },

    search() {
        const term = document.getElementById('materialSearch').value.toLowerCase();
        const materials = this.materials[this.currentTab];
        const filtered = term ? materials.filter(m => m.name.toLowerCase().includes(term)) : materials;
        
        const container = document.getElementById('materialsContent');
        if (filtered.length === 0) {
            container.innerHTML = '<p>Keine Materialien gefunden</p>';
        } else {
            this.renderMaterials();
        }
    },

    download(name) {
        showToast('info', `Download von "${name}" gestartet...`);
        authApp.logActivity('download', `Material heruntergeladen: ${name}`);
    }
};
