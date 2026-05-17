
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseAnonKey = typeof supabaseAnonKeyRaw === 'string' ? supabaseAnonKeyRaw.trim() : supabaseAnonKeyRaw

// Supabase anon/service role keys are JWTs (commonly start with 'eyJ').
// If a different/invalid key is provided, keep the app running in demo mode.
const isLikelySupabaseJwt = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 5

console.log("Initializing Supabase Client...");
console.log("URL:", supabaseUrl ? "Set" : "MISSING");
console.log("Key:", supabaseAnonKey ? "Set" : "MISSING " + (supabaseAnonKey ? "" : "(Check .env)"));

if (supabaseAnonKey && !isLikelySupabaseJwt) {
    console.warn("Supabase key format looks invalid (expected anon/service JWT starting with 'eyJ'). Running in demo mode.")
}

if (!supabaseUrl || !supabaseAnonKey || (supabaseAnonKey && !isLikelySupabaseJwt)) {
    console.error("CRITICAL: Missing Supabase Environment Variables. Check your .env file.");
}

// Mock Client for Demo/Development without Keys
const mockQueryResult = (data) => ({ data, error: null });
const mockSubscription = { unsubscribe: () => {} };
const mockChannel = {
    on: () => mockChannel,
    subscribe: () => mockChannel
};

const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: mockSubscription }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured (demo mode)') }),
    signUp: async () => ({ data: null, error: new Error('Supabase not configured (demo mode)') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
};

// --- Local API based Mock Client ---
// For the Hackathon demo, we talk to our local Python backend instead of Supabase
const BACKEND_URL = 'http://localhost:8000';

const mockFrom = (table) => {
    let result = { data: [], error: null };
    let queryPromise = null;

    const builder = {
        select: (cols) => {
            queryPromise = fetch(`${BACKEND_URL}/api/db/${table}`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    try {
                        localStorage.setItem(`chaukas_cache_${table}`, JSON.stringify(data));
                    } catch (e) {
                        console.warn('Failed to cache data for offline use:', table);
                    }
                    return { data, error: null };
                })
                .catch(err => {
                    console.warn(`Backend fetch failed for ${table}, attempting offline fallback.`, err);
                    try {
                        const cached = localStorage.getItem(`chaukas_cache_${table}`);
                        if (cached) {
                            console.log(`Served ${table} from offline cache.`);
                            return { data: JSON.parse(cached), error: null };
                        }
                    } catch (e) {
                        // Fallback failed
                    }
                    return { data: [], error: err };
                });
            return builder;
        },
        insert: (data) => {
            queryPromise = fetch(`${BACKEND_URL}/api/db/${table}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(resData => ({ data: [resData], error: null }))
            .catch(err => {
                console.error('Mock insert error:', err);
                return { data: null, error: err };
            });
            return builder;
        },
        update: () => builder,
        upsert: () => builder,
        delete: () => builder,
        eq: (col, val) => {
            if (queryPromise) {
                queryPromise = queryPromise.then(res => {
                    if (res.data && Array.isArray(res.data)) {
                        res.data = res.data.filter(item => item[col] === val);
                    }
                    return res;
                });
            }
            return builder;
        },
        order: (col, opts) => {
             if (queryPromise) {
                queryPromise = queryPromise.then(res => {
                    if (res.data && Array.isArray(res.data)) {
                        res.data.sort((a, b) => {
                            if (a[col] < b[col]) return opts?.ascending ? -1 : 1;
                            if (a[col] > b[col]) return opts?.ascending ? 1 : -1;
                            return 0;
                        });
                    }
                    return res;
                });
            }
            return builder;
        },
        limit: (n) => {
             if (queryPromise) {
                queryPromise = queryPromise.then(res => {
                    if (res.data && Array.isArray(res.data)) {
                        res.data = res.data.slice(0, n);
                    }
                    return res;
                });
            }
            return builder;
        },
        single: () => {
             if (queryPromise) {
                queryPromise = queryPromise.then(res => {
                    if (res.data && res.data.length > 0) {
                        res.data = res.data[0];
                    } else {
                        res.error = { code: 'PGRST116', message: 'No rows' };
                        res.data = null;
                    }
                    return res;
                });
            }
            return builder;
        },
        then: (onFulfilled, onRejected) => (queryPromise || Promise.resolve({data: [], error: null})).then(onFulfilled, onRejected),
        catch: (onRejected) => (queryPromise || Promise.resolve({data: [], error: null})).catch(onRejected),
        finally: (onFinally) => (queryPromise || Promise.resolve({data: [], error: null})).finally(onFinally)
    };

    return builder;
};

const mockSupabase = {
    auth: mockAuth,
    channel: () => mockChannel,
    removeChannel: () => {},
    removeAllChannels: async () => {},
    from: mockFrom,
    storage: {
        from: (bucket) => ({
            upload: async (path, file) => {
                const formData = new FormData();
                const res = await fetch(`${BACKEND_URL}/api/storage/${bucket}/${encodeURIComponent(path)}`, {
                    method: 'POST',
                    body: file // Assuming file is a Blob/File object
                });
                if (res.ok) {
                    return { data: { path }, error: null };
                } else {
                    return { data: null, error: new Error('Upload failed') };
                }
            },
            getPublicUrl: (path) => ({ data: { publicUrl: `${BACKEND_URL}/uploads/${bucket}/${path}` }, error: null })
        })
    }
};

export const supabase = (supabaseUrl && isLikelySupabaseJwt)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase;

if (!supabaseUrl || !supabaseAnonKey || (supabaseAnonKey && !isLikelySupabaseJwt)) {
    console.warn("⚠️  Running with MOCK Supabase Client (Demo Mode)");
}
