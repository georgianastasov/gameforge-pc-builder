import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent, IgxSwitchComponent } from '@infragistics/igniteui-angular';
import { BuildStateService } from '../services/build-state.service';
import { cardImage, PC_BUILDER_SLOT_IMAGES } from '../static-data/app-builder-images';

@Component({
  selector: 'app-pc-builder',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxSwitchComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, IgxSnackbarComponent, FormsModule, RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './pc-builder.component.html',
  styleUrls: ['./pc-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PCBuilderComponent {
  private readonly buildState = inject(BuildStateService);
  public assemblyTier = 'Standard Validation';
  public precisionTuning = false;
  public readonly flagshipEnthusiastPCBuildPcBuilderSlots = computed(() =>
    this.buildState.slots().map((slot, index) => ({ ...slot, imageUrl: cardImage(PC_BUILDER_SLOT_IMAGES, index) }))
  );
  public readonly filledSlotCount = this.buildState.filledSlotCount;
  public readonly totalSlotCount = this.buildState.totalSlotCount;
  public readonly subtotal = this.buildState.subtotal;

  public clickResetOptions(): void {
    this.assemblyTier = 'Standard Validation';
    this.precisionTuning = false;
  }
}
