// Shared CORS headers for edge functions.
// Matches the reference project's pattern (see ARCHITECTURE.md Reuse Note).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}