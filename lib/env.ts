import { z } from "zod";

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================
// This file validates all environment variables at startup.
// If any are missing or invalid, the app will fail fast with a clear error.
// ============================================================================

// Helper to extract project ref from Supabase URL
function extractProjectRef(url: string): string | null {
  const match = url.match(/https:\/\/([a-z]+)\.supabase\.co/);
  return match ? match[1] : null;
}

// Helper to extract project ref from JWT token
function extractRefFromJWT(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded.ref || null;
  } catch {
    return null;
  }
}

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  JWT_SECRET: z.string().min(1).optional(), // Optional - not currently used
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const _clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!_clientEnv.success) {
  console.error("❌ Invalid client environment variables:", _clientEnv.error.format());
  throw new Error("Invalid client environment variables");
}

// Validate that URL and ANON key are from the same project
const urlRef = extractProjectRef(_clientEnv.data.NEXT_PUBLIC_SUPABASE_URL);
const anonRef = extractRefFromJWT(_clientEnv.data.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (urlRef && anonRef && urlRef !== anonRef) {
  console.error(`
❌ SUPABASE CONFIGURATION MISMATCH DETECTED!
   
   URL project:  ${urlRef}
   Key project:  ${anonRef}
   
   Your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are from DIFFERENT projects.
   This will cause PGRST205 errors and authentication failures.
   
   Fix: Update .env.local so both URL and keys are from the SAME Supabase project.
   
   Go to your Supabase Dashboard > Project Settings > API to get the correct values.
`);
  throw new Error("Supabase URL and API key mismatch - they must be from the same project");
}

let _serverEnv: z.infer<typeof serverSchema> | undefined = undefined;

if (typeof window === "undefined") {
  const parsed = serverSchema.safeParse({
    JWT_SECRET: process.env.JWT_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:", parsed.error.format());
    throw new Error("Invalid server environment variables");
  }

  _serverEnv = parsed.data;

  // Validate service role key matches URL project
  const serviceRef = extractRefFromJWT(_serverEnv.SUPABASE_SERVICE_ROLE_KEY);
  if (urlRef && serviceRef && urlRef !== serviceRef) {
    console.error(`
❌ SUPABASE SERVICE ROLE KEY MISMATCH DETECTED!
   
   URL project:          ${urlRef}
   Service key project:  ${serviceRef}
   
   Your SUPABASE_SERVICE_ROLE_KEY is from a DIFFERENT project than NEXT_PUBLIC_SUPABASE_URL.
   
   Fix: Update .env.local so all keys are from the SAME Supabase project.
`);
    throw new Error("Supabase URL and Service Role key mismatch");
  }
}

export const env = {
  client: _clientEnv.data,
  server: _serverEnv!, // assert not null because we only access it on server
};

// ============================================================================
// DEBUGGING HELPER (only logs in development)
// ============================================================================
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.log(`✅ Supabase configured for project: ${urlRef}`);
}
