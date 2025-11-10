const ANONYMOUS_SESSION_KEY = "anonymous_session_id";

export function getAnonymousSessionId(): string {
  let sessionId = localStorage.getItem(ANONYMOUS_SESSION_KEY);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearAnonymousSession(): void {
  localStorage.removeItem(ANONYMOUS_SESSION_KEY);
}
