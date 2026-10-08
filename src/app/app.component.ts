import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { IGX_CHIPS_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_NAVBAR_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent } from '@infragistics/igniteui-angular';
import { AdminAuthService } from './services/admin-auth.service';

@Component({
  selector: 'app-root',
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IGX_NAVBAR_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IgxIconComponent, IgxButtonDirective, IgxBadgeComponent, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  public readonly isAdminSignedIn = this.auth.isSignedIn;

  public signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/home']);
  }
}
