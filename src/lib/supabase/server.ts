import { createServerClient } from "@supabase/ssr";
import { getRequest, getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

export interface SupabaseServerEnvironment {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  [key: string]: string | undefined;
}

type CloudflareRequest = Request & {
  runtime?: {
    cloudflare?: {
      env?: SupabaseServerEnvironment;
    };
  };
};

function getCloudflareSupabaseEnvironment(): SupabaseServerEnvironment | undefined {
  return (getRequest() as CloudflareRequest).runtime?.cloudflare?.env;
}

interface SupabaseServerConfig {
  url: string;
  publishableKey: string;
}

function getSupabaseServerConfig(
  environment?: SupabaseServerEnvironment,
): SupabaseServerConfig {
  const requestEnvironment = getCloudflareSupabaseEnvironment();

  const configEnvironment = environment ?? requestEnvironment;

  const url =
    configEnvironment?.SUPABASE_URL ??
    configEnvironment?.VITE_SUPABASE_URL ??
    import.meta.env["SUPABASE_URL"] ??
    import.meta.env["VITE_SUPABASE_URL"];

  const publishableKey =
    configEnvironment?.SUPABASE_PUBLISHABLE_KEY ??
    configEnvironment?.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env["SUPABASE_PUBLISHABLE_KEY"] ??
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    throw new Error(
      "Missing server Supabase configuration. Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}

export function createSupabaseServerClient(environment?: SupabaseServerEnvironment) {
  const supabaseConfig = getSupabaseServerConfig(environment);

  return createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }

        for (const [name, value] of Object.entries(headers)) {
          setResponseHeader(name as Parameters<typeof setResponseHeader>[0], value);
        }
      },
    },
  });
}
