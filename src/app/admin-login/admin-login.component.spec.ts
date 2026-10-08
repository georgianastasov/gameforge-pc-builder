import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminAuthService, DEMO_ADMIN_CREDENTIALS } from '../services/admin-auth.service';
import { AdminLoginComponent } from './admin-login.component';

@Component({ template: 'Backoffice' })
class BackofficeStubComponent {}

describe('AdminLoginComponent', () => {
  let harness: RouterTestingHarness;

  const open = async (url: string) => {
    harness = await RouterTestingHarness.create(url);
    return harness.routeDebugElement!.componentInstance as AdminLoginComponent;
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'admin-login', component: AdminLoginComponent },
          { path: 'admin-backoffice', component: BackofficeStubComponent },
          { path: 'home', component: BackofficeStubComponent }
        ])
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows the demo credentials and validates required fields', async () => {
    const component = await open('/admin-login');
    expect(harness.routeNativeElement?.textContent).toContain(DEMO_ADMIN_CREDENTIALS.email);
    component.signIn();
    harness.detectChanges();
    expect(component.showError('email')).toBe(true);
    expect(component.showError('password')).toBe(true);
    expect(TestBed.inject(AdminAuthService).isSignedIn()).toBe(false);
  });

  it('rejects wrong credentials with an alert', async () => {
    const component = await open('/admin-login');
    component.loginForm.setValue({ email: DEMO_ADMIN_CREDENTIALS.email, password: 'nope', remember: false });
    component.signIn();
    harness.detectChanges();
    expect(component.signInFailed()).toBe(true);
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain("don't match");
    expect(component.loginForm.controls.password.value).toBe('');
  });

  it('signs in and returns to the Backoffice', async () => {
    const component = await open('/admin-login?returnUrl=%2Fadmin-backoffice');
    component.loginForm.setValue({ ...DEMO_ADMIN_CREDENTIALS, remember: true });
    component.signIn();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/admin-backoffice');
    expect(TestBed.inject(AdminAuthService).currentSession()?.remembered).toBe(true);
  });

  it('ignores return URLs outside the Backoffice', async () => {
    const component = await open('/admin-login?returnUrl=%2Fhome');
    component.loginForm.setValue({ ...DEMO_ADMIN_CREDENTIALS, remember: false });
    component.signIn();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/admin-backoffice');
  });
});
