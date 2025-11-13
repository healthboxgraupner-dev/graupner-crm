// ===================================
// Utility Functions
// ===================================

const utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    },

    // Get today's date in YYYY-MM-DD format
    getTodayString() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Check if date is overdue
    isOverdue(dateString) {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateString);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    },

    // Calculate days difference
    daysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Format currency
    formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    },

    // Format percentage
    formatPercentage(value, decimals = 1) {
        return value.toFixed(decimals) + '%';
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Escape HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    // Get current week number
    getWeekNumber(d = new Date()) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `KW ${weekNo}/${d.getUTCFullYear()}`;
    },

    // Get month name
    getMonthName(monthIndex) {
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return months[monthIndex];
    },

    // Calculate conversion rate
    calculateConversion(conversions, total) {
        if (total === 0) return 0;
        return (conversions / total) * 100;
    },

    // Sort array of objects
    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];
            
            if (typeof valA === 'string') {
                return order === 'asc' 
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            
            return order === 'asc' ? valA - valB : valB - valA;
        });
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Get status emoji
    getStatusEmoji(status) {
        const emojiMap = {
            'neu': '🟢',
            'in_gespraech': '🟠',
            'angebot': '🔵',
            'abgeschlossen': '🔴'
        };
        return emojiMap[status] || '';
    },

    // Get status label
    getStatusLabel(status) {
        const labelMap = {
            'neu': 'Neu',
            'in_gespraech': 'In Gespräch',
            'angebot': 'Angebot',
            'abgeschlossen': 'Abgeschlossen',
            'pending': 'Ausstehend',
            'approved': 'Genehmigt',
            'active': 'Aktiv',
            'inactive': 'Inaktiv'
        };
        return labelMap[status] || status;
    },

    // Filter object by keys
    pick(obj, keys) {
        return keys.reduce((acc, key) => {
            if (obj.hasOwnProperty(key)) {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    }
};
