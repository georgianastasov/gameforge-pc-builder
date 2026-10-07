import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxDialogComponent, IgxIconComponent, IgxSnackbarComponent, IgxSwitchComponent } from '@infragistics/igniteui-angular';
import { BuildHealth, CheckStatus } from '../models/hardware/build-analysis';
import { HardwareCategory, toSlotParam } from '../models/hardware/hardware-part';
import { BuildStateService } from '../services/build-state.service';
import { cardImage, PC_BUILDER_SLOT_IMAGES } from '../static-data/app-builder-images';

/** Ignite UI badge and linear progress `type` values for each build state. */
const BADGE_TYPE: Record<BuildHealth, 'success' | 'warning' | 'error'> = { pass: 'success', warning: 'warning', fail: 'error' };
const STATUS_ICON: Record<CheckStatus, string> = { pass: 'verified', warning: 'warning', fail: 'error', pending: 'schedule' };

/** Row labels used by the Review Build dialog, in slot order. */
const REVIEW_LABELS: Record<HardwareCategory, string> = {
  CPU: 'CPU & Socket:',
  GPU: 'GPU & VRAM:',
  Motherboard: 'Motherboard:',
  RAM: 'Memory:',
  Storage: 'Storage:',
  Cooling: 'Cooling:',
  PSU: 'Power Supply:',
  Case: 'Case:'
};

const DEFAULT_SNACKBAR_MESSAGE = 'Custom rig configuration successfully validated and saved to session.';

@Component({
  selector: 'app-pc-builder',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxSwitchComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, IgxSnackbarComponent, FormsModule, RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './pc-builder.component.html',
  styleUrls: ['./pc-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PCBuilderComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly router = inject(Router);

  public readonly assemblyTier = this.buildState.assemblyTier;
  public readonly precisionTuning = this.buildState.precisionTuning;
  public readonly flagshipEnthusiastPCBuildPcBuilderSlots = computed(() =>
    this.buildState.slots().map((slot, index) => ({ ...slot, imageUrl: cardImage(PC_BUILDER_SLOT_IMAGES, index) }))
  );
  public readonly filledSlotCount = this.buildState.filledSlotCount;
  public readonly totalSlotCount = this.buildState.totalSlotCount;
  public readonly pricing = this.buildState.pricing;
  public readonly analysis = this.buildState.analysis;
  public readonly power = computed(() => this.analysis().power);
  public readonly toSlotParam = toSlotParam;
  public readonly badgeType = BADGE_TYPE;
  public readonly statusIcon = STATUS_ICON;

  /** Header badge: overall physical/electrical verdict. */
  public readonly clearanceBadge = computed(() => {
    const { health, failureCount, warningCount, isComplete, missingSlots } = this.analysis();
    // An incomplete build is reported separately from real part conflicts.
    const conflicts = failureCount - (isComplete ? 0 : 1);
    if (conflicts > 0) {
      return { type: BADGE_TYPE.fail, value: `${conflicts} Compatibility ${conflicts === 1 ? 'Conflict' : 'Conflicts'}` };
    }
    if (!isComplete) {
      return { type: BADGE_TYPE.warning, value: `${missingSlots.length} ${missingSlots.length === 1 ? 'Slot' : 'Slots'} Unpopulated` };
    }
    return health === 'warning'
      ? { type: BADGE_TYPE.warning, value: `${warningCount} Clearance ${warningCount === 1 ? 'Warning' : 'Warnings'}` }
      : { type: BADGE_TYPE.pass, value: '100% Clearance Verified' };
  });

  /** Header badge: CPU socket and motherboard form factor of the current build. */
  public readonly platformBadge = computed(() => {
    const parts = this.buildState.selectedParts();
    const socketCheck = this.analysis().checks.find(check => check.id === 'cpu-socket');
    if (!parts.CPU || !parts.Motherboard) {
      return { type: 'primary', value: 'Platform Pending' };
    }
    return socketCheck?.status === 'fail'
      ? { type: BADGE_TYPE.fail, value: `Socket Mismatch: ${parts.CPU.socket} CPU / ${parts.Motherboard.socket} Board` }
      : { type: 'primary', value: `Socket ${parts.CPU.socket} / ${parts.Motherboard.formFactor} Platform` };
  });

  /** Linear bar state: the fill is capped at 100 while the text shows the real load. */
  public readonly loadBar = computed(() => {
    const { utilisationPct, status } = this.power();
    return { value: Math.min(utilisationPct, 100), text: `${utilisationPct}%`, type: BADGE_TYPE[status] };
  });

  /** Plain-language clearance summary shown when nothing needs attention. */
  public readonly clearanceSummary = computed(() =>
    this.analysis().checks
      .filter(check => ['cpu-socket', 'gpu-clearance', 'cooling-case'].includes(check.id) && check.status === 'pass')
      .map(check => check.detail)
      .join(' ')
  );

  public readonly reviewRows = computed(() =>
    this.buildState.slots().map(slot => ({ category: slot.category, label: REVIEW_LABELS[slot.category], part: slot.part }))
  );

  public readonly canCheckout = computed(() => this.analysis().health !== 'fail');
  public readonly snackbarMessage = signal(DEFAULT_SNACKBAR_MESSAGE);

  public clickResetOptions(): void {
    this.buildState.resetOptions();
  }

  public saveConfiguration(snackbar: IgxSnackbarComponent): void {
    const saved = this.buildState.saveConfiguration();
    const issueCount = this.analysis().issues.length;
    this.snackbarMessage.set(!saved
      ? 'Configuration could not be saved: browser storage is unavailable.'
      : issueCount
        ? `Configuration saved with ${issueCount} unresolved compatibility ${issueCount === 1 ? 'issue' : 'issues'}. It will be restored after reload.`
        : 'Custom rig configuration successfully validated and saved. It will be restored after reload.');
    snackbar.open();
  }

  public proceedToCheckout(dialog: IgxDialogComponent): void {
    dialog.close();
    this.router.navigate(['/build-summary']);
  }
}
