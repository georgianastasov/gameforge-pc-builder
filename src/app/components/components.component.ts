import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_ACCORDION_DIRECTIVES, IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { HardwarePart } from '../models/hardware/hardware-part';
import { BuildStateService } from '../services/build-state.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';

@Component({
  selector: 'app-components',
  imports: [IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_ACCORDION_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxButtonDirective, IgxIconComponent, IgxBadgeComponent, IgxSnackbarComponent, RouterLink, FormsModule, DecimalPipe],
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsComponent {
  private readonly buildState = inject(BuildStateService);
  public value?: string;
  public readonly flagshipPCHardwareCatalogHighEndPcHardware = inject(FlagshipPCHardwareCatalogService).parts;

  public selectForRig(part: HardwarePart): void {
    this.buildState.selectPart(part);
  }
}
