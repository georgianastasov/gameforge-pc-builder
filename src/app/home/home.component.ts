import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent } from '@infragistics/igniteui-angular';
import { BuildPreset } from '../models/hardware/build-preset';
import { BuildStateService } from '../services/build-state.service';
import { EliteFlagshipPCTrioService } from '../services/elite-flagship-pctrio.service';

@Component({
  selector: 'app-home',
  imports: [IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, RouterLink, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly buildState = inject(BuildStateService);
  public readonly eliteFlagshipPCTrioCustomPcBuilds = inject(EliteFlagshipPCTrioService).presets;

  public loadPreset(preset: BuildPreset): void {
    this.buildState.loadPreset(preset.id);
  }
}
