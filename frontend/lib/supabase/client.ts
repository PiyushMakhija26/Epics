// Mock Supabase client for development
// In production, replace with actual @supabase/ssr createBrowserClient

let client: any = null;

export function createClient() {
  if (client) return client;

  // Mock client that simulates Supabase API
  client = {
    auth: {
      getUser: async () => {
        // Try to get from localStorage or return null
        const session = localStorage.getItem('user_session');
        return { 
          data: { 
            user: session ? JSON.parse(session) : null 
          }, 
          error: null 
        };
      },
      signOut: async () => {
        localStorage.removeItem('user_session');
        return {};
      },
      signUp: async (credentials: any) => {
        // Simulate signup
        const user = { id: 'user_' + Date.now(), email: credentials.email };
        localStorage.setItem('user_session', JSON.stringify(user));
        return { data: { user }, error: null };
      },
      signInWithPassword: async (credentials: any) => {
        // Simulate login
        const user = { id: 'user_demo', email: credentials.email };
        localStorage.setItem('user_session', JSON.stringify(user));
        return { data: { user }, error: null };
      },
    },
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          order: (col: string, options: any) => ({
            limit: (n: number) => async () => ({ data: [], error: null }),
          }),
        }),
        neq: (column: string, value: any) => ({
          select: () => ({ data: [], error: null }),
        }),
        order: (col: string, options: any) => ({
          data: [],
          error: null,
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ data: { id: 'req_' + Date.now(), ...data }, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: async (column: string, value: any) => ({ error: null }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => ({ error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: URL.createObjectURL(new Blob()) } }),
      }),
    },
  };

  return client;
}
