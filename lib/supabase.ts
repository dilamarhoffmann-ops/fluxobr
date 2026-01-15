import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper functions for authentication
export const auth = {
    // Sign up with email and password
    signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        return { data, error };
    },

    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    // Get current session
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};

// Helper functions for database operations
export const db = {
    // Generic select query
    from: (table: string) => supabase.from(table),

    // Insert data
    insert: async (table: string, data: any) => {
        const { data: result, error } = await supabase.from(table).insert(data).select();
        return { data: result, error };
    },

    // Update data
    update: async (table: string, id: string, data: any) => {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select();
        return { data: result, error };
    },

    // Delete data
    delete: async (table: string, id: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        return { error };
    },

    // Get single record by ID
    getById: async (table: string, id: string) => {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    // Get all records
    getAll: async (table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        return { data, error };
    },
};

// Storage helper functions
export const storage = {
    // Upload file
    upload: async (bucket: string, path: string, file: File) => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        return { data, error };
    },

    // Download file
    download: async (bucket: string, path: string) => {
        const { data, error } = await supabase.storage.from(bucket).download(path);
        return { data, error };
    },

    // Get public URL
    getPublicUrl: (bucket: string, path: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    // Delete file
    remove: async (bucket: string, paths: string[]) => {
        const { data, error } = await supabase.storage.from(bucket).remove(paths);
        return { data, error };
    },

    // List files
    list: async (bucket: string, path: string = '', options?: any) => {
        const { data, error } = await supabase.storage.from(bucket).list(path, options);
        return { data, error };
    },
};
