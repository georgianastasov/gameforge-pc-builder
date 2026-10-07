import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { IgcGridLite } from 'igniteui-grid-lite';
import { defineComponents } from 'igniteui-webcomponents';
import { HardwareCompatibilitySpecType } from '../models/hardware-compatibility-spec/hardware-compatibility-spec-type';
import { HardwarePart } from '../models/hardware/hardware-part';
import { BuildStateService } from '../services/build-state.service';
import { BUILD_SUMMARY_IMAGES, cardImage } from '../static-data/app-builder-images';

defineComponents(IgcGridLite);

/** The physical dimension that matters for a part's clearance check (mm). */
function clearanceMm(part: HardwarePart): number {
  return part.lengthMm ?? part.heightMm ?? part.radiatorMm ?? part.maxGpuLengthMm ?? 0;
}

@Component({
  selector: 'app-build-summary',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxIconComponent, IgxButtonDirective, IgxSnackbarComponent, RouterLink, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './build-summary.component.html',
  styleUrls: ['./build-summary.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSummaryComponent {
  private readonly buildState = inject(BuildStateService);
  public value = '1';
  public value1 = '1';
  public readonly enthusiastGamingRigSpecificationGamingPcComponents = computed(() =>
    this.buildState.slots().map((slot, index) => ({ ...slot, imageUrl: cardImage(BUILD_SUMMARY_IMAGES, index) }))
  );
  public readonly filledSlotCount = this.buildState.filledSlotCount;
  public readonly totalSlotCount = this.buildState.totalSlotCount;
  public readonly subtotal = this.buildState.subtotal;
  public readonly slotFillPercent = computed(() => Math.round((this.filledSlotCount() / this.totalSlotCount) * 100));

  public readonly hardwareCompatibilitySpecHardwareCompatibilitySpec = computed<HardwareCompatibilitySpecType[]>(() =>
    this.buildState.slots()
      .filter(slot => slot.part)
      .map((slot, index) => {
        const part = slot.part as HardwarePart;
        return {
          id: index + 1,
          componentName: part.name,
          socketOrFormFactor: part.socketOrFormFactor,
          tdpWattage: part.tdpWattage,
          dimensionClearanceMm: clearanceMm(part),
          statusNote: part.compatibilityNote
        };
      })
  );
}
