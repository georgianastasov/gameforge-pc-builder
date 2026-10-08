import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IGX_INPUT_GROUP_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxCheckboxComponent, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { AdminAuthService, DEMO_ADMIN_CREDENTIALS } from '../services/admin-auth.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';

const BACKOFFICE_URL = '/admin-backoffice';

@Component({
  selector: 'app-admin-login',
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IgxAvatarComponent, IgxIconComponent, IgxBadgeComponent, IgxCheckboxComponent, IgxButtonDirective, IgxSnackbarComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);
  private readonly returnUrl = inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl');
  private readonly snackbar = viewChild.required<IgxSnackbarComponent>('snackbar');

  public readonly demoCredentials = DEMO_ADMIN_CREDENTIALS;
  public readonly partCount = computed(() => this.catalog.parts().length);

  public readonly loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
    remember: new FormControl(true, { nonNullable: true })
  });
  public readonly submitAttempted = signal(false);
  public readonly signInFailed = signal(false);

  constructor() {
    // Explain the redirect when the guard sent the visitor here from the Backoffice.
    afterNextRender(() => {
      if (this.returnUrl) {
        this.snackbar().open();
      }
    });
  }

  public showError(control: 'email' | 'password'): boolean {
    const { invalid, touched } = this.loginForm.controls[control];
    return invalid && (touched || this.submitAttempted());
  }

  public signIn(): void {
    this.submitAttempted.set(true);
    this.signInFailed.set(false);
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password, remember } = this.loginForm.getRawValue();
    if (!this.auth.signIn(email, password, remember)) {
      this.signInFailed.set(true);
      this.submitAttempted.set(false);
      this.loginForm.controls.password.reset();
      return;
    }
    this.router.navigateByUrl(this.safeReturnUrl());
  }

  /** Only follow in-app Backoffice links, never an arbitrary URL from the query string. */
  private safeReturnUrl(): string {
    return this.returnUrl?.startsWith(BACKOFFICE_URL) ? this.returnUrl : BACKOFFICE_URL;
  }
}
