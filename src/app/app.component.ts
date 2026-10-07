import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IGX_CHIPS_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_NAVBAR_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent } from '@infragistics/igniteui-angular';

@Component({
  selector: 'app-root',
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IGX_NAVBAR_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IgxIconComponent, IgxButtonDirective, IgxBadgeComponent, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
