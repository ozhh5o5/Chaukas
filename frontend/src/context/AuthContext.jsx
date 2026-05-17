
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

// Simple hash function for local password storage (not crypto-secure, but fine for hackathon demo)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for local auth session first
        const savedAuth = localStorage.getItem('chaukas_auth_session');
        if (savedAuth) {
            try {
                const { user: savedUser, profile: savedProfile } = JSON.parse(savedAuth);
                console.log('AuthContext: Restoring session for', savedUser.email);
                setUser(savedUser);
                setProfile(savedProfile);
                setLoading(false);
                return;
            } catch (e) {
                console.error('AuthContext: Invalid saved session');
                localStorage.removeItem('chaukas_auth_session');
            }
        }

        // Legacy fallback_auth check
        const fallbackAuth = localStorage.getItem('fallback_auth');
        if (fallbackAuth) {
            try {
                const { user: fbUser, profile: fbProfile } = JSON.parse(fallbackAuth);
                setUser(fbUser);
                setProfile(fbProfile);
                // Migrate to new key
                localStorage.setItem('chaukas_auth_session', fallbackAuth);
                localStorage.removeItem('fallback_auth');
                setLoading(false);
                return;
            } catch (e) {
                localStorage.removeItem('fallback_auth');
            }
        }

        // Seed demo user account if not exists (for hackathon demo)
        const users = JSON.parse(localStorage.getItem('chaukas_users') || '{}');
        if (!users['user@demo.com']) {
            users['user@demo.com'] = {
                id: '00000000-0000-0000-0000-000000000002',
                full_name: 'Demo User',
                passwordHash: simpleHash('demo'),
                created_at: new Date().toISOString()
            };
            localStorage.setItem('chaukas_users', JSON.stringify(users));
        }

        // No saved session — not logged in
        setLoading(false);
    }, []);

    // Get local user store
    const getLocalUsers = () => {
        try {
            return JSON.parse(localStorage.getItem('chaukas_users') || '{}');
        } catch { return {}; }
    };

    const saveLocalUsers = (users) => {
        localStorage.setItem('chaukas_users', JSON.stringify(users));
    };

    const persistSession = (userData, profileData) => {
        setUser(userData);
        setProfile(profileData);
        localStorage.setItem('chaukas_auth_session', JSON.stringify({
            user: userData,
            profile: profileData
        }));
    };

    const signIn = async (email, password) => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const pwd = (password || '').trim();

        // 1. Admin login
        if (normalizedEmail === 'admin@demo.com' && pwd === 'demo@123') {
            console.log('AuthContext: Admin login');
            const mockUser = {
                id: '00000000-0000-0000-0000-000000000001',
                email: 'admin@demo.com',
                user_metadata: { full_name: 'System Administrator' }
            };
            const mockProfile = {
                id: '00000000-0000-0000-0000-000000000001',
                full_name: 'System Administrator',
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            persistSession(mockUser, mockProfile);
            return { user: mockUser };
        }

        // 2. Local user login
        const users = getLocalUsers();
        if (users[normalizedEmail]) {
            const stored = users[normalizedEmail];
            if (stored.passwordHash === simpleHash(pwd)) {
                console.log('AuthContext: Local user login', normalizedEmail);
                const localUser = {
                    id: stored.id,
                    email: normalizedEmail,
                    user_metadata: { full_name: stored.full_name }
                };
                const localProfile = {
                    id: stored.id,
                    full_name: stored.full_name,
                    role: 'user',
                    created_at: stored.created_at,
                    updated_at: new Date().toISOString()
                };
                persistSession(localUser, localProfile);
                return { user: localUser };
            } else {
                throw new Error('Invalid password. Please try again.');
            }
        }

        // 3. No local user found
        throw new Error('Account not found. Please register first.');
    };

    const signUp = async (email, password, fullName, role = 'user') => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const pwd = (password || '').trim();

        if (!normalizedEmail || !pwd || !fullName) {
            throw new Error('All fields are required.');
        }

        if (pwd.length < 4) {
            throw new Error('Password must be at least 4 characters.');
        }

        if (normalizedEmail === 'admin@demo.com') {
            throw new Error('Cannot register with admin email.');
        }

        const users = getLocalUsers();
        if (users[normalizedEmail]) {
            throw new Error('Account already exists. Please login.');
        }

        // Create new local user
        const userId = crypto.randomUUID ? crypto.randomUUID() : 
            'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const newUser = {
            id: userId,
            full_name: fullName.trim(),
            passwordHash: simpleHash(pwd),
            created_at: new Date().toISOString()
        };

        users[normalizedEmail] = newUser;
        saveLocalUsers(users);

        console.log('AuthContext: User registered', normalizedEmail);

        // Auto-login after signup
        const userData = {
            id: userId,
            email: normalizedEmail,
            user_metadata: { full_name: fullName.trim() }
        };
        const profileData = {
            id: userId,
            full_name: fullName.trim(),
            role: 'user',
            created_at: newUser.created_at,
            updated_at: new Date().toISOString()
        };
        persistSession(userData, profileData);
        return { user: userData };
    };

    const signOut = async () => {
        // Save last route before logout
        localStorage.removeItem('chaukas_auth_session');
        localStorage.removeItem('fallback_auth');
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile, 
            loading, 
            signIn, 
            signUp, 
            signOut,
            isAdmin: profile?.role === 'admin',
            isUser: profile?.role === 'user'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
