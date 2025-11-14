// ===================================
// Messages Module
// ===================================

const messagesModule = {
    render(container) {
        const isAdminOrTeamleader = authApp.currentUser.role === 'admin' || authApp.currentUser.role === 'teamleader';
        
        if (!isAdminOrTeamleader) {
            container.innerHTML = '<div class="card"><p>Keine Berechtigung</p></div>';
            return;
        }

        const allMessages = DB.get('messages');
        const user = authApp.currentUser;
        
        // Teamleader sehen nur Mitteilungen an ihr Team
        const messages = user.role === 'admin' 
            ? allMessages 
            : allMessages.filter(m => {
                if (m.userId === 'all') return true;
                if (m.userId === user.id) return true;
                // Prüfe ob Nachricht an Team-Mitglied gerichtet ist
                const targetUser = DB.findById('users', m.userId);
                return targetUser && targetUser.teamleader === user.id;
            });

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Mitteilungen verwalten</h2>
                    <button class="btn btn-primary" onclick="messagesModule.showSendForm()">
                        <i class="fas fa-paper-plane"></i> Neue Mitteilung senden
                    </button>
                </div>

                <div style="margin: 20px 0; padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <strong>📊 Statistik:</strong><br>
                    Gesamt: ${messages.length} | 
                    Ungelesen: ${messages.filter(m => !m.read).length} | 
                    An alle: ${messages.filter(m => m.userId === 'all').length}
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Typ</th>
                            <th>Titel</th>
                            <th>Nachricht</th>
                            <th>Empfänger</th>
                            <th>Status</th>
                            <th>Erstellt</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${messages.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-500);">
                                    Noch keine Mitteilungen vorhanden
                                </td>
                            </tr>
                        ` : messages.sort((a, b) => b.timestamp - a.timestamp).map(m => `
                            <tr>
                                <td>
                                    <i class="fas fa-${this.getTypeIcon(m.type)}" 
                                       style="color: ${this.getTypeColor(m.type)}; font-size: 20px;"></i>
                                </td>
                                <td><strong>${m.title}</strong></td>
                                <td>${m.text.substring(0, 50)}${m.text.length > 50 ? '...' : ''}</td>
                                <td>${this.getRecipientName(m.userId)}</td>
                                <td>
                                    <span class="badge ${m.read ? 'active' : 'inactive'}">
                                        ${m.read ? 'Gelesen' : 'Ungelesen'}
                                    </span>
                                </td>
                                <td>${getRelativeTime(m.timestamp)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="messagesModule.viewMessage('${m.id}')" 
                                            style="margin-right: 8px;">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="messagesModule.deleteMessage('${m.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showSendForm() {
        const users = DB.get('users');
        const currentUser = authApp.currentUser;
        
        // Teamleader sehen nur ihr Team
        const availableUsers = currentUser.role === 'admin' 
            ? users 
            : users.filter(u => u.teamleader === currentUser.id || u.id === currentUser.id);

        document.body.insertAdjacentHTML('beforeend', `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); 
                        display: flex; align-items: center; justify-content: center; z-index: 1000;" 
                 onclick="this.remove()">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;"
                     onclick="event.stopPropagation()">
                    <h2>Neue Mitteilung senden</h2>
                    <form onsubmit="messagesModule.sendMessage(event)">
                        <div class="form-group">
                            <label>Empfänger *</label>
                            <select id="msgRecipient" onchange="messagesModule.updateRecipientPreview()" required>
                                <option value="all">📢 An alle Benutzer</option>
                                ${currentUser.role === 'admin' ? `
                                    <optgroup label="Nach Rolle">
                                        <option value="role:partner">👥 Alle Partner</option>
                                        <option value="role:teamleader">👔 Alle Teamleader</option>
                                        <option value="role:admin">🔑 Alle Admins</option>
                                    </optgroup>
                                ` : ''}
                                <optgroup label="Einzelne Benutzer">
                                    ${availableUsers.map(u => `
                                        <option value="${u.id}">👤 ${u.name} (${u.role})</option>
                                    `).join('')}
                                </optgroup>
                            </select>
                            <small id="recipientPreview" style="color: var(--gray-600); margin-top: 8px; display: block;">
                                📊 Erreicht: Alle Benutzer
                            </small>
                        </div>

                        <div class="form-group">
                            <label>Typ *</label>
                            <select id="msgType" onchange="messagesModule.updateTypePreview()" required>
                                <option value="info">ℹ️ Info - Allgemeine Information</option>
                                <option value="wichtig">⚠️ Wichtig - Dringende Mitteilung</option>
                                <option value="success">✅ Erfolg - Positive Nachricht</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Titel *</label>
                            <input type="text" id="msgTitle" required placeholder="z.B. Neues Update verfügbar" maxlength="100">
                        </div>

                        <div class="form-group">
                            <label>Nachricht *</label>
                            <textarea id="msgText" rows="5" required placeholder="Ihre Nachricht..." maxlength="500"></textarea>
                            <small><span id="charCount">0</span>/500 Zeichen</small>
                        </div>

                        <div id="messagePreview" style="margin: 20px 0; padding: 16px; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--accent-cyan);">
                            <strong>👁️ Vorschau:</strong>
                            <div style="margin-top: 12px; padding: 16px; background: white; border-radius: 8px;">
                                <div style="display: flex; gap: 16px; align-items: start;">
                                    <div id="previewIcon" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(0, 212, 255, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent-cyan); flex-shrink: 0;">
                                        <i class="fas fa-info-circle"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <div id="previewTitle" style="font-weight: 600; margin-bottom: 4px;">Titel der Mitteilung</div>
                                        <div id="previewText" style="color: var(--gray-600); font-size: 14px;">Nachrichtentext erscheint hier...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-paper-plane"></i> Mitteilung senden
                        </button>
                        <button type="button" class="btn" onclick="this.closest('div[style*=fixed]').remove()" 
                                style="margin-left: 10px;">Abbrechen</button>
                    </form>
                </div>
            </div>
        `);

        // Event Listeners für Live-Vorschau
        document.getElementById('msgTitle').addEventListener('input', () => this.updatePreview());
        document.getElementById('msgText').addEventListener('input', () => {
            this.updatePreview();
            this.updateCharCount();
        });

        this.updatePreview();
    },

    updateRecipientPreview() {
        const recipient = document.getElementById('msgRecipient').value;
        const preview = document.getElementById('recipientPreview');
        const users = DB.get('users');

        if (recipient === 'all') {
            preview.textContent = `📊 Erreicht: Alle ${users.length} Benutzer`;
        } else if (recipient.startsWith('role:')) {
            const role = recipient.split(':')[1];
            const count = users.filter(u => u.role === role).length;
            const roleNames = { partner: 'Partner', teamleader: 'Teamleader', admin: 'Admins' };
            preview.textContent = `📊 Erreicht: ${count} ${roleNames[role]}`;
        } else {
            const user = DB.findById('users', recipient);
            preview.textContent = `📊 Erreicht: 1 Benutzer (${user ? user.name : 'Unbekannt'})`;
        }
    },

    updateTypePreview() {
        this.updatePreview();
    },

    updateCharCount() {
        const text = document.getElementById('msgText').value;
        document.getElementById('charCount').textContent = text.length;
    },

    updatePreview() {
        const type = document.getElementById('msgType').value;
        const title = document.getElementById('msgTitle').value || 'Titel der Mitteilung';
        const text = document.getElementById('msgText').value || 'Nachrichtentext erscheint hier...';

        const icon = document.getElementById('previewIcon');
        const titleEl = document.getElementById('previewTitle');
        const textEl = document.getElementById('previewText');

        // Icon & Farbe aktualisieren
        const typeConfig = {
            info: { icon: 'info-circle', color: 'var(--accent-cyan)', bg: 'rgba(0, 212, 255, 0.1)' },
            wichtig: { icon: 'exclamation-triangle', color: 'var(--warning-orange)', bg: 'rgba(245, 158, 11, 0.1)' },
            success: { icon: 'check-circle', color: 'var(--success-green)', bg: 'rgba(16, 185, 129, 0.1)' }
        };

        const config = typeConfig[type];
        icon.style.backgroundColor = config.bg;
        icon.style.color = config.color;
        icon.innerHTML = `<i class="fas fa-${config.icon}"></i>`;

        titleEl.textContent = title;
        textEl.textContent = text;
    },

    sendMessage(e) {
        e.preventDefault();

        const recipient = document.getElementById('msgRecipient').value;
        const type = document.getElementById('msgType').value;
        const title = document.getElementById('msgTitle').value;
        const text = document.getElementById('msgText').value;

        const users = DB.get('users');
        let targetUsers = [];

        // Empfänger bestimmen
        if (recipient === 'all') {
            targetUsers = users.map(u => u.id);
        } else if (recipient.startsWith('role:')) {
            const role = recipient.split(':')[1];
            targetUsers = users.filter(u => u.role === role).map(u => u.id);
        } else {
            targetUsers = [recipient];
        }

        // Mitteilung für jeden Empfänger erstellen
        targetUsers.forEach(userId => {
            const message = {
                id: generateId('msg'),
                userId: userId,
                type: type,
                title: title,
                text: text,
                timestamp: Date.now(),
                read: false,
                sender: authApp.currentUser.name,
                senderId: authApp.currentUser.id
            };
            DB.add('messages', message);
        });

        showToast('success', `Mitteilung an ${targetUsers.length} Empfänger gesendet`);
        authApp.logActivity('message_sent', `Mitteilung gesendet: "${title}" an ${targetUsers.length} Empfänger`);

        document.querySelector('div[style*="fixed"]').remove();
        app.navigateTo('messages');
    },

    viewMessage(id) {
        const message = DB.findById('messages', id);
        if (!message) return;

        const recipient = this.getRecipientName(message.userId);
        
        alert(`📨 Mitteilungs-Details\n\n` +
              `Typ: ${message.type}\n` +
              `Titel: ${message.title}\n` +
              `Nachricht: ${message.text}\n\n` +
              `Empfänger: ${recipient}\n` +
              `Status: ${message.read ? 'Gelesen' : 'Ungelesen'}\n` +
              `Gesendet: ${formatDateTime(message.timestamp)}\n` +
              `Von: ${message.sender || 'System'}`);
    },

    deleteMessage(id) {
        const message = DB.findById('messages', id);
        if (!message) return;

        if (confirm(`⚠️ Mitteilung "${message.title}" wirklich löschen?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
            DB.delete('messages', id);
            showToast('success', 'Mitteilung gelöscht');
            authApp.logActivity('message_deleted', `Mitteilung gelöscht: ${message.title}`);
            app.navigateTo('messages');
        }
    },

    getRecipientName(userId) {
        if (userId === 'all') return '📢 Alle Benutzer';
        
        const user = DB.findById('users', userId);
        return user ? `👤 ${user.name}` : 'Unbekannt';
    },

    getTypeIcon(type) {
        const icons = {
            info: 'info-circle',
            wichtig: 'exclamation-triangle',
            success: 'check-circle',
            warning: 'exclamation-triangle' // Legacy support
        };
        return icons[type] || 'bell';
    },

    getTypeColor(type) {
        const colors = {
            info: 'var(--accent-cyan)',
            wichtig: 'var(--warning-orange)',
            success: 'var(--success-green)',
            warning: 'var(--warning-orange)' // Legacy support
        };
        return colors[type] || 'var(--gray-600)';
    }
};
