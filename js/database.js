// ===================================
// LocalStorage Database Layer
// ===================================

const DB = {
    // Initialize database with demo data
    init() {
        if (!localStorage.getItem('crm_initialized')) {
            this.resetToDemo();
            localStorage.setItem('crm_initialized', 'true');
        }
    },

    // Reset database to demo data
    resetToDemo() {
        const demoData = {
            users: [
                {
                    id: 'admin_001',
                    name: 'Administrator',
                    email: 'admin@healthbox.ae',
                    password: 'HealthBox2025!Admin',
                    role: 'admin',
                    status: 'active',
                    created: Date.now()
                },
                {
                    id: 'tl_001',
                    name: 'Thomas Müller',
                    email: 'thomas.mueller@healthbox.ae',
                    password: 'Demo2025!',
                    role: 'teamleader',
                    status: 'active',
                    created: Date.now()
                },
                {
                    id: 'partner_001',
                    name: 'Anna Schmidt',
                    email: 'anna.schmidt@healthbox.ae',
                    password: 'Demo2025!',
                    role: 'partner',
                    status: 'active',
                    teamleader: 'tl_001',
                    created: Date.now()
                },
                {
                    id: 'partner_002',
                    name: 'Michael Weber',
                    email: 'michael.weber@healthbox.ae',
                    password: 'Demo2025!',
                    role: 'partner',
                    status: 'active',
                    teamleader: 'tl_001',
                    created: Date.now()
                },
                {
                    id: 'partner_003',
                    name: 'Sarah Fischer',
                    email: 'sarah.fischer@healthbox.ae',
                    password: 'Demo2025!',
                    role: 'partner',
                    status: 'active',
                    teamleader: 'tl_001',
                    created: Date.now()
                }
            ],
            leads: [
                {
                    id: 'lead_001',
                    name: 'Dr. Max Mustermann',
                    email: 'max.mustermann@example.com',
                    phone: '+49 172 1234567',
                    amount: 25000,
                    product: 'HealthBox Core',
                    status: 'neu',
                    priority: 'hoch',
                    source: 'Empfehlung',
                    assignedTo: 'partner_001',
                    notes: 'Interessiert an Core-Paket mit quartalsweiser Auszahlung',
                    created: Date.now() - 86400000 * 2
                },
                {
                    id: 'lead_002',
                    name: 'Anna Schneider',
                    email: 'anna.schneider@example.com',
                    phone: '+49 172 2345678',
                    amount: 100000,
                    product: 'HealthBox Core',
                    status: 'kontaktiert',
                    priority: 'hoch',
                    source: 'Website',
                    assignedTo: 'partner_001',
                    notes: 'Erstkontakt erfolgreich, Folgetermin vereinbart',
                    created: Date.now() - 86400000 * 5
                },
                {
                    id: 'lead_003',
                    name: 'Thomas Becker',
                    email: 'thomas.becker@example.com',
                    phone: '+49 172 3456789',
                    amount: 500000,
                    product: 'HealthBox Elite',
                    status: 'qualifiziert',
                    priority: 'hoch',
                    source: 'Event',
                    assignedTo: 'partner_002',
                    notes: 'VIP-Kunde, hohes Interesse an Elite-Paket',
                    created: Date.now() - 86400000 * 10
                },
                {
                    id: 'lead_004',
                    name: 'Maria Klein',
                    email: 'maria.klein@example.com',
                    phone: '+41 79 1234567',
                    amount: 50000,
                    product: 'HealthBox Core',
                    status: 'abgeschlossen',
                    priority: 'mittel',
                    source: 'Empfehlung',
                    assignedTo: 'partner_002',
                    notes: 'Vertrag unterzeichnet, Zahlung eingegangen',
                    created: Date.now() - 86400000 * 15
                },
                {
                    id: 'lead_005',
                    name: 'Peter Wagner',
                    email: 'peter.wagner@example.com',
                    phone: '+43 664 1234567',
                    amount: 10000,
                    product: 'HealthBox Secure',
                    status: 'neu',
                    priority: 'mittel',
                    source: 'Social Media',
                    assignedTo: 'partner_003',
                    notes: 'Erstinvestor, benötigt Beratung',
                    created: Date.now() - 86400000 * 1
                },
                {
                    id: 'lead_006',
                    name: 'Julia Hoffmann',
                    email: 'julia.hoffmann@example.com',
                    phone: '+49 172 4567890',
                    amount: 200000,
                    product: 'HealthBox Elite',
                    status: 'kontaktiert',
                    priority: 'hoch',
                    source: 'Direktkontakt',
                    assignedTo: 'partner_003',
                    notes: 'Sehr interessiert, wartet auf Unterlagen',
                    created: Date.now() - 86400000 * 3
                }
            ],
            followups: [
                {
                    id: 'fu_001',
                    leadId: 'lead_001',
                    leadName: 'Dr. Max Mustermann',
                    type: 'Anruf',
                    dueDate: Date.now() + 86400000,
                    notes: 'Rückruf wegen Vertragsdetails',
                    status: 'ausstehend',
                    priority: 'hoch',
                    assignedTo: 'partner_001',
                    created: Date.now()
                },
                {
                    id: 'fu_002',
                    leadId: 'lead_002',
                    leadName: 'Anna Schneider',
                    type: 'Meeting',
                    dueDate: Date.now() + 86400000 * 3,
                    notes: 'Persönliches Treffen in München',
                    status: 'ausstehend',
                    priority: 'hoch',
                    assignedTo: 'partner_001',
                    created: Date.now()
                },
                {
                    id: 'fu_003',
                    leadId: 'lead_003',
                    leadName: 'Thomas Becker',
                    type: 'E-Mail',
                    dueDate: Date.now() - 86400000,
                    notes: 'Zusätzliche Dokumentation senden',
                    status: 'ausstehend',
                    priority: 'hoch',
                    assignedTo: 'partner_002',
                    created: Date.now() - 86400000 * 2
                }
            ],
            calendar: [
                {
                    id: 'cal_001',
                    title: 'Kundentermin: Anna Schneider',
                    date: Date.now() + 86400000 * 3,
                    duration: 60,
                    location: 'München, Hauptbahnhof',
                    description: 'Persönliches Beratungsgespräch',
                    leadId: 'lead_002',
                    assignedTo: 'partner_001',
                    reminder: 60,
                    created: Date.now()
                },
                {
                    id: 'cal_002',
                    title: 'Team-Meeting',
                    date: Date.now() + 86400000 * 7,
                    duration: 90,
                    location: 'Online (Zoom)',
                    description: 'Wöchentliches Team-Meeting',
                    assignedTo: 'tl_001',
                    reminder: 30,
                    created: Date.now()
                },
                {
                    id: 'cal_003',
                    title: 'Follow-up Call: Dr. Max Mustermann',
                    date: Date.now() + 86400000,
                    duration: 30,
                    location: 'Telefon',
                    description: 'Rückruf wegen Vertragsdetails',
                    leadId: 'lead_001',
                    assignedTo: 'partner_001',
                    reminder: 15,
                    created: Date.now()
                }
            ],
            activities: [
                {
                    id: 'act_001',
                    type: 'login',
                    user: 'Administrator',
                    userId: 'admin_001',
                    description: 'Administrator hat sich angemeldet',
                    timestamp: Date.now() - 3600000
                },
                {
                    id: 'act_002',
                    type: 'lead_created',
                    user: 'Anna Schmidt',
                    userId: 'partner_001',
                    description: 'Neuer Lead erstellt: Dr. Max Mustermann',
                    timestamp: Date.now() - 7200000
                },
                {
                    id: 'act_003',
                    type: 'lead_status',
                    user: 'Anna Schmidt',
                    userId: 'partner_001',
                    description: 'Lead-Status geändert: Anna Schneider → Kontaktiert',
                    timestamp: Date.now() - 10800000
                },
                {
                    id: 'act_004',
                    type: 'followup_created',
                    user: 'Michael Weber',
                    userId: 'partner_002',
                    description: 'Follow-up erstellt für Thomas Becker',
                    timestamp: Date.now() - 14400000
                },
                {
                    id: 'act_005',
                    type: 'lead_closed',
                    user: 'Michael Weber',
                    userId: 'partner_002',
                    description: 'Lead abgeschlossen: Maria Klein (50.000 €)',
                    timestamp: Date.now() - 86400000
                }
            ],
            messages: [
                {
                    id: 'msg_001',
                    type: 'info',
                    title: 'Neuer Lead',
                    text: 'Peter Wagner (HealthBox Secure, 10.000 €) wurde angelegt',
                    timestamp: Date.now() - 3600000,
                    read: false,
                    userId: 'partner_003'
                },
                {
                    id: 'msg_002',
                    type: 'warning',
                    title: 'Follow-up überfällig',
                    text: 'Follow-up für Thomas Becker ist seit gestern überfällig',
                    timestamp: Date.now() - 86400000,
                    read: false,
                    userId: 'partner_002'
                },
                {
                    id: 'msg_003',
                    type: 'success',
                    title: 'Quartalsbericht verfügbar',
                    text: 'Der Quartalsbericht Q4 2024 steht zum Download bereit',
                    timestamp: Date.now() - 86400000 * 2,
                    read: false,
                    userId: 'all'
                },
                {
                    id: 'msg_004',
                    type: 'info',
                    title: 'Team-Meeting',
                    text: 'Team-Meeting am nächsten Montag um 10:00 Uhr',
                    timestamp: Date.now() - 86400000 * 3,
                    read: false,
                    userId: 'all'
                }
            ],
            settings: {
                defaultCommission: 10,
                teamCommission: 5,
                currency: 'EUR',
                language: 'de',
                notifications: {
                    email: true,
                    inApp: true
                }
            }
        };

        // Save to localStorage
        localStorage.setItem('crm_users', JSON.stringify(demoData.users));
        localStorage.setItem('crm_leads', JSON.stringify(demoData.leads));
        localStorage.setItem('crm_followups', JSON.stringify(demoData.followups));
        localStorage.setItem('crm_calendar', JSON.stringify(demoData.calendar));
        localStorage.setItem('crm_activities', JSON.stringify(demoData.activities));
        localStorage.setItem('crm_messages', JSON.stringify(demoData.messages));
        localStorage.setItem('crm_settings', JSON.stringify(demoData.settings));
    },

    // Get data from localStorage
    get(key) {
        const data = localStorage.getItem(`crm_${key}`);
        return data ? JSON.parse(data) : [];
    },

    // Save data to localStorage
    set(key, data) {
        localStorage.setItem(`crm_${key}`, JSON.stringify(data));
    },

    // Add item to collection
    add(collection, item) {
        const data = this.get(collection);
        data.push(item);
        this.set(collection, data);
        return item;
    },

    // Update item in collection
    update(collection, id, updates) {
        const data = this.get(collection);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.set(collection, data);
            return data[index];
        }
        return null;
    },

    // Delete item from collection
    delete(collection, id) {
        const data = this.get(collection);
        const filtered = data.filter(item => item.id !== id);
        this.set(collection, filtered);
        return true;
    },

    // Find item by ID
    findById(collection, id) {
        const data = this.get(collection);
        return data.find(item => item.id === id);
    },

    // Find items by criteria
    find(collection, criteria) {
        const data = this.get(collection);
        return data.filter(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
    }
};

// Initialize database on load
DB.init();
