// ===================================
// Supabase Database Management
// Replaces: js/database.js (LocalStorage)
// ===================================

const supabaseDb = {
    // ===================================
    // INITIALIZATION
    // ===================================
    async init() {
        console.log('Supabase Database initialized');
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('Active session found:', session.user.email);
        }
    },

    // ===================================
    // USERS
    // ===================================
    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data || [];
    },

    async getUserById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        return data;
    },

    async getUserByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // User not found
                return null;
            }
            console.error('Error fetching user by email:', error);
            return null;
        }
        return data;
    },

    async createUser(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating user:', error);
            throw error;
        }
        return data;
    },

    async updateUser(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }
        return data;
    },

    async deleteUser(id) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // ===================================
    // LEADS
    // ===================================
    async getLeads(userId = null) {
        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching leads:', error);
            return [];
        }
        return data || [];
    },

    async createLead(leadData) {
        const { data, error } = await supabase
            .from('leads')
            .insert([leadData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
        return data;
    },

    async updateLead(id, updates) {
        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating lead:', error);
            throw error;
        }
        return data;
    },

    async deleteLead(id) {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting lead:', error);
            throw error;
        }
    },

    // ===================================
    // CALLS
    // ===================================
    async getCalls(userId = null) {
        let query = supabase
            .from('calls')
            .select('*')
            .order('date', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching calls:', error);
            return [];
        }
        return data || [];
    },

    async createCall(callData) {
        const { data, error } = await supabase
            .from('calls')
            .insert([callData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating call:', error);
            throw error;
        }
        return data;
    },

    async updateCall(id, updates) {
        const { data, error } = await supabase
            .from('calls')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating call:', error);
            throw error;
        }
        return data;
    },

    async deleteCall(id) {
        const { error } = await supabase
            .from('calls')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting call:', error);
            throw error;
        }
    },

    // ===================================
    // FOLLOWUPS
    // ===================================
    async getFollowups(userId = null) {
        let query = supabase
            .from('followups')
            .select('*')
            .order('date', { ascending: true });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching followups:', error);
            return [];
        }
        return data || [];
    },

    async createFollowup(followupData) {
        const { data, error } = await supabase
            .from('followups')
            .insert([followupData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating followup:', error);
            throw error;
        }
        return data;
    },

    async updateFollowup(id, updates) {
        const { data, error } = await supabase
            .from('followups')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating followup:', error);
            throw error;
        }
        return data;
    },

    async deleteFollowup(id) {
        const { error } = await supabase
            .from('followups')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting followup:', error);
            throw error;
        }
    },

    // ===================================
    // REFLECTIONS
    // ===================================
    async getReflections(userId = null) {
        let query = supabase
            .from('reflections')
            .select('*')
            .order('week_start', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching reflections:', error);
            return [];
        }
        return data || [];
    },

    async createReflection(reflectionData) {
        const { data, error } = await supabase
            .from('reflections')
            .insert([reflectionData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating reflection:', error);
            throw error;
        }
        return data;
    },

    async updateReflection(id, updates) {
        const { data, error } = await supabase
            .from('reflections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating reflection:', error);
            throw error;
        }
        return data;
    },

    async deleteReflection(id) {
        const { error } = await supabase
            .from('reflections')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting reflection:', error);
            throw error;
        }
    },

    // ===================================
    // MONTHLY DATA
    // ===================================
    async getMonthlyData(userId = null) {
        let query = supabase
            .from('monthly_data')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching monthly data:', error);
            return [];
        }
        return data || [];
    },

    async createMonthlyData(monthlyData) {
        const { data, error } = await supabase
            .from('monthly_data')
            .insert([monthlyData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating monthly data:', error);
            throw error;
        }
        return data;
    },

    async updateMonthlyData(id, updates) {
        const { data, error } = await supabase
            .from('monthly_data')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating monthly data:', error);
            throw error;
        }
        return data;
    },

    async deleteMonthlyData(id) {
        const { error } = await supabase
            .from('monthly_data')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting monthly data:', error);
            throw error;
        }
    },

    // ===================================
    // NOTIFICATIONS
    // ===================================
    async getNotifications(userId = null) {
        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    },

    async createNotification(notificationData) {
        const { data, error } = await supabase
            .from('notifications')
            .insert([notificationData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
        return data;
    },

    async updateNotification(id, updates) {
        const { data, error } = await supabase
            .from('notifications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
        return data;
    },

    async markNotificationAsRead(id) {
        return this.updateNotification(id, { read: true });
    },

    async deleteNotification(id) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // ===================================
    // MATERIALS
    // ===================================
    async getMaterials() {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching materials:', error);
            return [];
        }
        return data || [];
    },

    async createMaterial(materialData) {
        const { data, error } = await supabase
            .from('materials')
            .insert([materialData])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating material:', error);
            throw error;
        }
        return data;
    },

    async updateMaterial(id, updates) {
        const { data, error } = await supabase
            .from('materials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating material:', error);
            throw error;
        }
        return data;
    },

    async deleteMaterial(id) {
        const { error } = await supabase
            .from('materials')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting material:', error);
            throw error;
        }
    },

    // ===================================
    // SETTINGS
    // ===================================
    async getSettings(userId) {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // Settings not found, create default
                return this.createSettings(userId);
            }
            console.error('Error fetching settings:', error);
            return null;
        }
        return data;
    },

    async createSettings(userId) {
        const defaultSettings = {
            user_id: userId,
            notify_followups: true,
            notify_new_leads: true,
            notify_weekly_summary: true,
            notify_team: true,
            notify_system: true,
            date_format: 'DD.MM.YYYY'
        };

        const { data, error } = await supabase
            .from('settings')
            .insert([defaultSettings])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating settings:', error);
            return defaultSettings;
        }
        return data;
    },

    async updateSettings(userId, updates) {
        const { data, error } = await supabase
            .from('settings')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
        return data;
    },

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    generateId() {
        // Supabase handles UUID generation automatically
        // This is kept for compatibility
        return crypto.randomUUID();
    }
};

// Alias 'db' to 'supabaseDb' for compatibility (COMMENTED OUT - using localStorage db for now)
// const db = supabaseDb;

// Initialize on load (COMMENTED OUT - will be used later during Supabase migration)
// document.addEventListener('DOMContentLoaded', () => {
//     supabaseDb.init();
// });
