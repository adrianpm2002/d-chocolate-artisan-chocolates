import { createBrowserClient } from "@supabase/ssr";

function getBrowserSupabaseConfig(): {
  url: string;
  publishableKey: string;
} {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    throw new Error(
      "Missing public Supabase configuration. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}

const supabaseConfig = getBrowserSupabaseConfig();

export const supabase = createBrowserClient(
  supabaseConfig.url,
  supabaseConfig.publishableKey,
);
