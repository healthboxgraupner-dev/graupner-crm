// ===================================
// Profile Page
// ===================================

const profilePage = {
    render() {
        const user = authApp.currentUser;
        const profilePicture = user.profilePicture || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%231e3a8a" width="120" height="120"/><text x="60" y="60" font-size="48" fill="white" text-anchor="middle" dy=".3em">' + user.name.charAt(0) + '</text></svg>';

        return `
            <div class="page-header">
                <h1><i class="fas fa-user"></i> Mein Profil</h1>
                <p>Verwalten Sie Ihre persönlichen Informationen</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Profilbild</h2>
                </div>
                
                <div style="text-align: center; padding: 20px;">
                    <div style="position: relative; display: inline-block;">
                        <img id="profilePicturePreview" src="${profilePicture}" alt="Profilbild" 
                             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-blue);">
                        <button class="btn btn-primary btn-sm" onclick="document.getElementById('profilePictureInput').click()" 
                                style="position: absolute; bottom: 0; right: 0; border-radius: 50%; width: 40px; height: 40px; padding: 0;">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <input type="file" id="profilePictureInput" accept="image/*" style="display: none;" onchange="profilePage.uploadProfilePicture(event)">
                    <p class="text-muted" style="margin-top: 10px; font-size: 13px;">
                        <i class="fas fa-info-circle"></i> Klicken Sie auf die Kamera, um ein Bild hochzuladen
                    </p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Persönliche Informationen</h2>
                </div>

                <form id="profileForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileName"><i class="fas fa-user"></i> Name</label>
                            <input type="text" id="profileName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="profileEmail"><i class="fas fa-envelope"></i> E-Mail</label>
                            <input type="email" id="profileEmail" value="${user.email}" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="profilePhone"><i class="fas fa-phone"></i> Telefon</label>
                            <input type="tel" id="profilePhone" value="${user.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-shield-alt"></i> Rolle</label>
                            <input type="text" value="${this.getRoleLabel(user.role)}" disabled style="background: var(--grey-lighter);">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Änderungen speichern
                        </button>
                    </div>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Passwort ändern</h2>
                </div>

                <form id="passwordForm">
                    <div class="form-group">
                        <label for="currentPassword"><i class="fas fa-lock"></i> Aktuelles Passwort</label>
                        <input type="password" id="currentPassword" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newPassword"><i class="fas fa-key"></i> Neues Passwort</label>
                            <input type="password" id="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword"><i class="fas fa-key"></i> Passwort bestätigen</label>
                            <input type="password" id="confirmPassword" required minlength="6">
                        </div>
                    </div>
                    <div class="info-text">
                        <i class="fas fa-info-circle"></i> Passwort muss mindestens 6 Zeichen lang sein.
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-warning">
                            <i class="fas fa-lock"></i> Passwort ändern
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    init() {
        // Profile form handler
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Password form handler
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });
    },

    uploadProfilePicture(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            utils.showToast('Bild ist zu groß! Maximum 2MB.', 'error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            utils.showToast('Bitte nur Bilddateien hochladen!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            
            // Update preview
            document.getElementById('profilePicturePreview').src = base64Image;
            
            // Save to user
            db.updateUser(authApp.currentUser.id, { profilePicture: base64Image });
            authApp.currentUser.profilePicture = base64Image;
            authApp.setSession(authApp.currentUser);
            
            utils.showToast('Profilbild aktualisiert!', 'success');
        };
        reader.readAsDataURL(file);
    },

    updateProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;

        // Check if email is already taken by another user
        const existingUser = db.getUserByEmail(email);
        if (existingUser && existingUser.id !== authApp.currentUser.id) {
            utils.showToast('Diese E-Mail wird bereits verwendet!', 'error');
            return;
        }

        // Update user
        const updates = { name, email, phone };
        db.updateUser(authApp.currentUser.id, updates);
        
        // Update session
        authApp.currentUser = { ...authApp.currentUser, ...updates };
        authApp.setSession(authApp.currentUser);
        
        // Update header
        document.getElementById('headerUserName').textContent = name;

        utils.showToast('Profil erfolgreich aktualisiert!', 'success');
    },

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Verify current password
        if (currentPassword !== authApp.currentUser.password) {
            utils.showToast('Aktuelles Passwort ist falsch!', 'error');
            return;
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            utils.showToast('Neue Passwörter stimmen nicht überein!', 'error');
            return;
        }

        // Check password strength
        if (newPassword.length < 6) {
            utils.showToast('Passwort muss mindestens 6 Zeichen lang sein!', 'error');
            return;
        }

        // Update password
        db.updateUser(authApp.currentUser.id, { password: newPassword });
        authApp.currentUser.password = newPassword;
        authApp.setSession(authApp.currentUser);

        // Clear form
        document.getElementById('passwordForm').reset();

        utils.showToast('Passwort erfolgreich geändert!', 'success');
    },

    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrator',
            'teamleader': 'Team-Leader',
            'partner': 'Partner'
        };
        return labels[role] || role;
    }
};
