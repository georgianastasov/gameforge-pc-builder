import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AdminAuthService, DEMO_ADMIN_CREDENTIALS } from './admin-auth.service';
import { adminGuard, adminLoginGuard } from './admin.guards';

const { email, password } = DEMO_ADMIN_CREDENTIALS;

describe('AdminAuthService', () => {
  let service: AdminAuthService;

  const freshService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    return TestBed.inject(AdminAuthService);
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AdminAuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('rejects anything but the demo credentials', () => {
    expect(service.signIn(email, 'wrong', false)).toBe(false);
    expect(service.signIn('someone@gameforge.tech', password, false)).toBe(false);
    expect(service.isSignedIn()).toBe(false);
  });

  it('signs in case-insensitively by email and signs out', () => {
    expect(service.signIn(` ${email.toUpperCase()} `, password, false)).toBe(true);
    expect(service.isSignedIn()).toBe(true);
    expect(service.currentSession()?.email).toBe(email);
    service.signOut();
    expect(service.isSignedIn()).toBe(false);
  });

  it('remembers the workstation in localStorage and a tab session in sessionStorage', () => {
    service.signIn(email, password, true);
    expect(localStorage.getItem('gameforge.adminSession')).not.toBeNull();
    expect(freshService().isSignedIn()).toBe(true);

    service = TestBed.inject(AdminAuthService);
    service.signIn(email, password, false);
    expect(localStorage.getItem('gameforge.adminSession')).toBeNull();
    expect(sessionStorage.getItem('gameforge.adminSession')).not.toBeNull();
  });

  it('drops expired sessions', () => {
    localStorage.setItem('gameforge.adminSession', JSON.stringify({ version: 1, email, signedInAt: 1, expiresAt: 2, remembered: true }));
    expect(freshService().isSignedIn()).toBe(false);
    expect(localStorage.getItem('gameforge.adminSession')).toBeNull();
  });

  describe('guards', () => {
    const state = (url: string) => ({ url }) as RouterStateSnapshot;
    const route = {} as ActivatedRouteSnapshot;
    const run = (guard: typeof adminGuard, url: string) => TestBed.runInInjectionContext(() => guard(route, state(url)));

    it('redirects signed-out visitors from the Backoffice to Admin Login with a return URL', () => {
      const result = run(adminGuard, '/admin-backoffice');
      expect(result).toBeInstanceOf(UrlTree);
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/admin-login?returnUrl=%2Fadmin-backoffice');
    });

    it('lets signed-in admins into the Backoffice and past the login page', () => {
      service.signIn(email, password, false);
      expect(run(adminGuard, '/admin-backoffice')).toBe(true);
      const result = run(adminLoginGuard, '/admin-login');
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/admin-backoffice');
    });
  });
});
