/**
 * describeError — maps raw errors from edge functions / PostgREST into
 * user-facing messages. Especially translates Gemini 429 quota failures into
 * something actionable instead of "Gemini API returned 429".
 */
export function describeError(error, fallback = 'Something went wrong') {
  const raw = error?.message ?? String(error ?? '')
  if (/429|quota|rate.?limit/i.test(raw)) {
    return 'The AI service hit its rate limit right now — please try again in a little while.'
  }
  if (/not authenticated|no authorization|invalid jwt|401/i.test(raw)) {
    return 'Please sign in first so your data can be saved to your account.'
  }
  if (/failed to fetch|network|econnreset/i.test(raw)) {
    return 'Network problem reaching the server — check your connection and retry.'
  }
  return raw || fallback
}
