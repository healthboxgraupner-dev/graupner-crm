// ===================================
// Utility Functions
// ===================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format datetime
function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get relative time (e.g., "vor 2 Stunden")
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
    if (hours > 0) return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
    if (minutes > 0) return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    return 'gerade eben';
}

// Show toast notification
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'times-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Generate unique ID
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calculate commission
function calculateCommission(amount, percentage) {
    return (amount * percentage) / 100;
}

// Get HealthBox product details
function getProductDetails(productName) {
    const products = {
        'HealthBox Secure': {
            name: 'HealthBox Secure',
            description: 'Versicherte Investition mit stabilen Renditen',
            tiers: [
                { min: 10000, max: 24999, quarterlyRate: 3, annualRate: 18 },
                { min: 25000, max: 99999, quarterlyRate: 3.75, annualRate: 21 },
                { min: 100000, max: Infinity, quarterlyRate: 4.5, annualRate: 24 }
            ],
            insured: true
        },
        'HealthBox Core': {
            name: 'HealthBox Core',
            description: '50% versichert mit höheren Renditen',
            tiers: [
                { min: 10000, max: 24999, quarterlyRate: 6, annualRate: 30 },
                { min: 25000, max: 99999, quarterlyRate: 6.75, annualRate: 33 },
                { min: 100000, max: Infinity, quarterlyRate: 7.5, annualRate: 36 }
            ],
            insured: '50%'
        },
        'HealthBox Elite': {
            name: 'HealthBox Elite',
            description: 'Unversichert mit Premium-Renditen',
            tiers: [
                { min: 25000, max: 199999, quarterlyRate: 9, annualRate: 42 },
                { min: 200000, max: 499999, quarterlyRate: 9.75, annualRate: 45 },
                { min: 500000, max: Infinity, quarterlyRate: 10.5, annualRate: 48 }
            ],
            insured: false
        }
    };
    
    return products[productName] || null;
}

// Calculate returns for investment
function calculateReturns(amount, productName) {
    const product = getProductDetails(productName);
    if (!product) return null;
    
    const tier = product.tiers.find(t => amount >= t.min && amount <= t.max);
    if (!tier) return null;
    
    return {
        product: productName,
        amount: amount,
        quarterlyRate: tier.quarterlyRate,
        annualRate: tier.annualRate,
        quarterlyReturn: (amount * tier.quarterlyRate) / 100,
        annualReturn: (amount * tier.annualRate) / 100,
        insured: product.insured
    };
}

// Export data to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('warning', 'Keine Daten zum Exportieren vorhanden');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(','))
    ].join('\\n');
    
    downloadFile(csvContent, filename, 'text/csv');
}

// Export data to JSON
function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('success', `Datei "${filename}" wurde heruntergeladen`);
}

// Generate .ics calendar file
function generateICS(event) {
    const startDate = new Date(event.date);
    const endDate = new Date(event.date + (event.duration || 60) * 60000);
    
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Longevity Capital CRM//EN',
        'BEGIN:VEVENT',
        `UID:${event.id}@longevitycapital.ae`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\\r\\n');
    
    downloadFile(icsContent, `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`, 'text/calendar');
}

// Search/filter data
function filterData(data, searchTerm, fields) {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// Sort data
function sortData(data, field, direction = 'asc') {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (direction === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });
}

// Validate email
function isValidEmail(email) {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
}

// Validate phone
function isValidPhone(phone) {
    const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$/;
    return regex.test(phone);
}

// Get status badge color
function getStatusBadgeClass(status) {
    const classes = {
        'neu': 'badge-info',
        'kontaktiert': 'badge-warning',
        'qualifiziert': 'badge-primary',
        'abgeschlossen': 'badge-success',
        'abgelehnt': 'badge-danger',
        'ausstehend': 'badge-warning',
        'erledigt': 'badge-success',
        'active': 'badge-success',
        'inactive': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
}

// Get priority badge color
function getPriorityBadgeClass(priority) {
    const classes = {
        'hoch': 'badge-danger',
        'mittel': 'badge-warning',
        'niedrig': 'badge-info'
    };
    return classes[priority] || 'badge-secondary';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
