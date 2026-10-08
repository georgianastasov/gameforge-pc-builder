import { computed, Injectable, signal } from '@angular/core';
import { readVersioned, removeStored, writeVersioned } from './versioned-storage';

/**
 * The single demo administrator. This is client-side demo authentication only:
 * anything shipped to the browser can be read, so it does not protect real data.
 */
export const DEMO_ADMIN_CREDENTIALS = { email: 'admin@gameforge.tech', password: 'forge-admin' } as const;

export interface AdminSession {
  email: string;
  signedInAt: number;
  expiresAt: number;
  /** Remembered sessions survive closing the browser; others end with the tab. */
  remembered: boolean;
}

const STORAGE_KEY = 'gameforge.adminSession';
const STORAGE_VERSION = 1;
/** A remembered workstation stays signed in for a working day; a tab session for one hour. */
const REMEMBERED_SESSION_MS = 8 * 60 * 60 * 1000;
const TAB_SESSION_MS = 60 * 60 * 1000;

/** Demo admin sign-in state for the Backoffice. */
@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly session = signal<AdminSession | null>(loadSession());

  public readonly currentSession = this.session.asReadonly();
  public readonly isSignedIn = computed(() => this.session() !== null);

  /** Signs in when the credentials match the demo admin; returns whether it succeeded. */
  public signIn(email: string, password: string, remember: boolean): boolean {
    if (email.trim().toLowerCase() !== DEMO_ADMIN_CREDENTIALS.email || password !== DEMO_ADMIN_CREDENTIALS.password) {
      return false;
    }
    const signedInAt = Date.now();
    const session: AdminSession = {
      email: DEMO_ADMIN_CREDENTIALS.email,
      signedInAt,
      expiresAt: signedInAt + (remember ? REMEMBERED_SESSION_MS : TAB_SESSION_MS),
      remembered: remember
    };
    clearStoredSessions();
    writeVersioned(STORAGE_KEY, STORAGE_VERSION, session, remember ? 'local' : 'session');
    this.session.set(session);
    return true;
  }

  public signOut(): void {
    clearStoredSessions();
    this.session.set(null);
  }

  /** True while a session exists and has not expired; an expired session is signed out. */
  public hasValidSession(): boolean {
    const session = this.session();
    if (session && session.expiresAt <= Date.now()) {
      this.signOut();
      return false;
    }
    return session !== null;
  }
}

function clearStoredSessions(): void {
  removeStored(STORAGE_KEY, 'local');
  removeStored(STORAGE_KEY, 'session');
}

function loadSession(): AdminSession | null {
  const stored = readVersioned(STORAGE_KEY, STORAGE_VERSION, 'local') ?? readVersioned(STORAGE_KEY, STORAGE_VERSION, 'session');
  if (!stored || stored['email'] !== DEMO_ADMIN_CREDENTIALS.email || typeof stored['signedInAt'] !== 'number' || typeof stored['expiresAt'] !== 'number') {
    return null;
  }
  if (stored['expiresAt'] <= Date.now()) {
    clearStoredSessions();
    return null;
  }
  return { email: DEMO_ADMIN_CREDENTIALS.email, signedInAt: stored['signedInAt'], expiresAt: stored['expiresAt'], remembered: stored['remembered'] === true };
}
