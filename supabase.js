// supabase.js - Единая точка инициализации Supabase

// ВАЖНО: Замените эти ключи на свои актуальные из Supabase Dashboard
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Инициализация клиента
const supabase = (function() {
    if (typeof supabase !== 'undefined') {
        return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        // Fallback если CDN не загрузился (обычно не требуется при правильном подключении в head)
        console.error('Supabase library not loaded. Check script tag in HTML.');
        return null;
    }
})();

// Глобальный объект window.sb
window.sb = {
    client: supabase,

    // Проверка сессии и получение профиля
    // Возвращает объект профиля или null
    getCurrentProfile: async function() {
        const { data: { session }, error: sessionError } = await this.client.auth.getSession();
        
        if (sessionError || !session) return null;

        const { data: profile, error: profileError } = await this.client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError || !profile) return null;

        // ПРОВЕРКА БАНА
        if (profile.is_banned) {
            await this.logout();
            alert('Ваш аккаунт заблокирован администратором.');
            return null;
        }

        return profile;
    },

    // Обязательная проверка авторизации для защищенных страниц
    requireAuth: async function(allowedRoles = []) {
        const profile = await this.getCurrentProfile();

        if (!profile) {
            window.location.href = 'index.html';
            return null;
        }

        // Если роль 'admin', пропускаем везде, кроме специфичных случаев, если нужно
        if (profile.role === 'admin') {
            return profile; 
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
            // Если роль не подходит, редиректим на свой дашборд
            if (profile.role === 'landlord') window.location.href = 'landlord.html';
            else if (profile.role === 'tenant') window.location.href = 'tenant.html';
            return null;
        }

        return profile;
    },

    // Вход
    login: async function(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Выход
    logout: async function() {
        await this.client.auth.signOut();
        window.location.href = 'index.html';
    },

    // Регистрация
    register: async function(email, password, role) {
        // 1. Создаем юзера в Auth
        const { data: authData, error: authError } = await this.client.auth.signUp({
            email,
            password
        });

        if (authError) return { error: authError };

        if (authData.user) {
            // 2. Создаем запись в profiles
            const { error: profileError } = await this.client
                .from('profiles')
                .insert([
                    { id: authData.user.id, role: role }
                ]);
            
            if (profileError) return { error: profileError };
        }

        return { data: authData };
    },

    // Хелпер: Является ли текущий юзер админом
    isAdmin: async function() {
        const profile = await this.getCurrentProfile();
        return profile && profile.role === 'admin';
    }
};
