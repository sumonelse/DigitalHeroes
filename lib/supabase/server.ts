// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* middleware handles refresh */
          }
        },
      },
    },
  );
}

export async function createServiceClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

export function createPublicClient(): SupabaseClient {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** Get the authed user or throw — use in Server Actions / Route Handlers */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

/** Get full profile of the authed user */
export async function getAuthProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

/** Helper to get a single row with proper typing */
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

/** Helper to check if user is admin */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return (data as { is_admin: boolean })?.is_admin ?? false;
}

/** Update a row with proper typing */
export async function updateRow<T extends keyof Database["public"]["Tables"]>(
  tableName: T,
  data: Database["public"]["Tables"][T]["Update"],
  filter: { eq: [string, unknown] },
) {
  const supabase = await createClient();
  const { error } = await (supabase.from(tableName) as any)
    .update(data)
    .eq(...filter.eq);
  if (error) throw error;
  return { success: true };
}

/** Get single row with auto-typing (avoids TypeScript inference issues) */
export async function getOne<T>(builder: {
  single(): Promise<{ data: T | null }>;
}): Promise<T | null> {
  const { data } = await builder.single();
  return data;
}
