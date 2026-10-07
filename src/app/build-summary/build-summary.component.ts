import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxDialogComponent, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { IgxGridLiteCellTemplateDirective, IgxGridLiteColumnComponent, IgxGridLiteComponent } from '@infragistics/igniteui-angular/grids/lite';
import { BuildHealth, CHECK_SLOTS, CheckStatus, slotStatus } from '../models/hardware/build-analysis';
import { calculateCheckout, getShippingOption, PaymentId, ShippingId } from '../models/hardware/checkout-pricing';
import { HARDWARE_CATEGORIES } from '../models/hardware/hardware-part';
import { BuildStateService } from '../services/build-state.service';
import { OrderService } from '../services/order.service';
import { BUILD_SUMMARY_IMAGES, cardImage } from '../static-data/app-builder-images';

/** Ignite UI badge / linear bar `type` per status. */
const STATUS_TYPE: Record<CheckStatus, 'success' | 'warning' | 'error' | 'info'> = { pass: 'success', warning: 'warning', fail: 'error', pending: 'info' };
const HEALTH_TYPE: Record<BuildHealth, 'success' | 'warning' | 'error'> = { pass: 'success', warning: 'warning', fail: 'error' };
const STATUS_LABEL: Record<CheckStatus, string> = { pass: 'Pass', warning: 'Warning', fail: 'Fail', pending: 'Pending' };
const STATUS_ICON: Record<CheckStatus, string> = { pass: 'verified', warning: 'warning', fail: 'error', pending: 'schedule' };

/** Row shape for the compatibility Grid Lite. */
export interface CompatibilityGridRow {
  check: string;
  components: string;
  status: string;
  details: string;
}

@Component({
  selector: 'app-build-summary',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxIconComponent, IgxButtonDirective, IgxSnackbarComponent, IgxGridLiteComponent, IgxGridLiteColumnComponent, IgxGridLiteCellTemplateDirective, RouterLink, ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './build-summary.component.html',
  styleUrls: ['./build-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSummaryComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);

  public readonly statusType = STATUS_TYPE;
  public readonly healthType = HEALTH_TYPE;
  public readonly statusIcon = STATUS_ICON;

  public readonly analysis = this.buildState.analysis;
  public readonly power = computed(() => this.analysis().power);
  public readonly filledSlotCount = this.buildState.filledSlotCount;
  public readonly totalSlotCount = this.buildState.totalSlotCount;
  public readonly assemblyTier = this.buildState.assemblyTier;
  public readonly precisionTuning = this.buildState.precisionTuning;
  public readonly slotFillPercent = computed(() => Math.round((this.filledSlotCount() / this.totalSlotCount) * 100));

  public readonly enthusiastGamingRigSpecificationGamingPcComponents = computed(() => {
    const analysis = this.analysis();
    return this.buildState.slots().map((slot, index) => {
      const status = slotStatus(analysis, slot.category);
      return {
        ...slot,
        imageUrl: cardImage(BUILD_SUMMARY_IMAGES, index),
        badgeType: STATUS_TYPE[status],
        badgeValue: status === 'pending' ? 'Not Selected' : status === 'pass' ? 'Compatible' : STATUS_LABEL[status]
      };
    });
  });

  // Summary cards
  public readonly slotsCard = computed(() => {
    const { missingSlots } = this.analysis();
    return missingSlots.length
      ? { type: STATUS_TYPE.warning, icon: STATUS_ICON.warning, text: `Missing: ${missingSlots.join(', ')}`, caption: `${missingSlots.length} unfilled component ${missingSlots.length === 1 ? 'bay' : 'bays'} remaining` }
      : { type: STATUS_TYPE.pass, icon: 'check_circle', text: 'CPU, GPU, MB, RAM, Storage, AIO, PSU & Case', caption: 'Zero unfilled component bays remaining' };
  });

  public readonly powerCard = computed(() => {
    const power = this.power();
    const psu = this.buildState.selectedParts().PSU;
    return {
      type: HEALTH_TYPE[power.status],
      icon: power.status === 'pass' ? 'bolt' : STATUS_ICON[power.status],
      value: Math.min(power.utilisationPct, 100),
      text: `${power.utilisationPct}%`,
      detail: psu ? `${power.capacityW}W ${psu.name} • ${power.utilisationPct}% Peak Capacity` : 'No PSU selected',
      caption: !power.capacityW ? 'Select a PSU to calculate headroom' : power.headroomW >= 0 ? `${power.headroomW}W transient surge headroom preserved` : `Exceeds PSU capacity by ${-power.headroomW}W`
    };
  });

  public readonly compatibilityCard = computed(() => {
    const { checks, failureCount, warningCount, health, isComplete, missingSlots } = this.analysis();
    const parts = this.buildState.selectedParts();
    const verifiable = checks.filter(c => c.status !== 'pending');
    const passed = verifiable.filter(c => c.status === 'pass').length;
    const conflicts = failureCount - (isComplete ? 0 : 1);
    const title = conflicts > 0
      ? `${conflicts} ${conflicts === 1 ? 'Conflict' : 'Conflicts'} Found`
      : !isComplete ? 'Build Incomplete' : warningCount ? `${warningCount} ${warningCount === 1 ? 'Warning' : 'Warnings'}` : '100% Compatible';
    const facts = [
      parts.CPU?.socket ? `${parts.CPU.socket} Socket` : null,
      parts.GPU?.lengthMm && parts.Case?.maxGpuLengthMm ? `${parts.GPU.lengthMm}mm GPU in ${parts.Case.maxGpuLengthMm}mm Bay` : null
    ].filter(Boolean);
    return {
      title,
      type: HEALTH_TYPE[health],
      icon: health === 'pass' ? 'verified' : STATUS_ICON[health],
      value: verifiable.length ? Math.round((passed / verifiable.length) * 100) : 0,
      detail: facts.join(' • ') || 'Select parts to verify clearances',
      caption: health === 'pass'
        ? 'Zero physical or thermal clearance conflicts'
        : conflicts > 0 ? `${conflicts} blocking ${conflicts === 1 ? 'conflict' : 'conflicts'} to resolve in PC Builder` : !isComplete ? `Fill ${missingSlots.length} more ${missingSlots.length === 1 ? 'slot' : 'slots'} to verify every clearance` : `${warningCount} advisory ${warningCount === 1 ? 'warning' : 'warnings'}; ordering is allowed`
    };
  });

  /** Compatibility checks shaped for the Grid Lite. */
  public readonly compatibilityRows = computed<CompatibilityGridRow[]>(() => {
    const parts = this.buildState.selectedParts();
    return this.analysis().checks.map(check => {
      const slots = check.id === 'slots' ? HARDWARE_CATEGORIES : CHECK_SLOTS[check.id];
      return {
        check: check.label,
        components: slots.map(slot => parts[slot]?.name ?? `No ${slot}`).join(' + '),
        status: STATUS_LABEL[check.status],
        details: check.detail
      };
    });
  });

  // Checkout
  public readonly checkoutForm = new FormGroup({
    shipping: new FormControl<ShippingId>('ground', { nonNullable: true, validators: Validators.required }),
    payment: new FormControl<PaymentId | null>(null, Validators.required)
  });
  private readonly checkoutValue = toSignal(this.checkoutForm.valueChanges, { initialValue: this.checkoutForm.value });
  public readonly submitAttempted = signal(false);

  public readonly checkout = computed(() => {
    const { shipping, payment } = this.checkoutValue();
    return calculateCheckout(this.buildState.pricing(), shipping ?? null, payment ?? null);
  });
  public readonly shippingOption = computed(() => getShippingOption(this.checkoutValue().shipping ?? null));

  /** Ordering requires every slot filled and no failing compatibility check. */
  public readonly canOrder = computed(() => this.analysis().health !== 'fail');
  public readonly orderBlockReason = computed(() => {
    const { isComplete, missingSlots, failureCount } = this.analysis();
    if (!isComplete) {
      return `Fill the remaining ${missingSlots.length === 1 ? 'slot' : 'slots'} (${missingSlots.join(', ')}) in PC Builder before ordering.`;
    }
    return failureCount ? `Resolve ${failureCount} compatibility ${failureCount === 1 ? 'failure' : 'failures'} in PC Builder before ordering.` : null;
  });

  public readonly configurationName = computed(() => this.buildState.activePreset()?.name ?? 'Custom GameForge Configuration');

  /** The confirmed order, shown while the build still matches what was ordered. */
  public readonly confirmedOrder = computed(() => {
    const order = this.orders.lastOrder();
    const selection = this.buildState.currentSelection();
    return order && HARDWARE_CATEGORIES.every(c => order.selection[c] === selection[c]) ? order : null;
  });

  public readonly headerBadges = computed(() => {
    const { isComplete, missingSlots } = this.analysis();
    const slots = isComplete
      ? { type: STATUS_TYPE.pass, value: `ALL ${this.totalSlotCount} SLOTS VERIFIED` }
      : { type: STATUS_TYPE.warning, value: `${missingSlots.length} ${missingSlots.length === 1 ? 'SLOT' : 'SLOTS'} EMPTY` };
    const readiness = this.confirmedOrder()
      ? { type: STATUS_TYPE.pass, value: 'ORDER CONFIRMED' }
      : this.canOrder() ? { type: STATUS_TYPE.pending, value: 'READY FOR BENCHMARKING' } : { type: STATUS_TYPE.fail, value: 'ORDER BLOCKED' };
    return [slots, readiness];
  });

  public readonly clearanceBadge = computed(() => {
    const { health, failureCount, warningCount } = this.analysis();
    return health === 'pass'
      ? { type: HEALTH_TYPE.pass, value: 'ALL CLEARANCES PASSED' }
      : health === 'fail' ? { type: HEALTH_TYPE.fail, value: `${failureCount} ${failureCount === 1 ? 'CHECK' : 'CHECKS'} FAILED` } : { type: HEALTH_TYPE.warning, value: `${warningCount} ${warningCount === 1 ? 'WARNING' : 'WARNINGS'}` };
  });

  public badgeTypeForStatus(label: string): string {
    const status = (Object.keys(STATUS_LABEL) as CheckStatus[]).find(key => STATUS_LABEL[key] === label) ?? 'pending';
    return STATUS_TYPE[status];
  }

  public openCheckout(dialog: IgxDialogComponent): void {
    this.submitAttempted.set(false);
    dialog.open();
  }

  public confirmOrder(dialog: IgxDialogComponent, snackbar: IgxSnackbarComponent): void {
    this.submitAttempted.set(true);
    this.checkoutForm.markAllAsTouched();
    const { shipping, payment } = this.checkoutForm.getRawValue();
    if (!this.canOrder() || this.checkoutForm.invalid || !payment) {
      return;
    }
    const lines = this.buildState.slots().flatMap(slot => slot.part
      ? [{ category: slot.category, partId: slot.part.id, name: slot.part.name, price: slot.part.price }]
      : []);
    this.orders.placeOrder({
      configurationName: this.configurationName(),
      selection: { ...this.buildState.currentSelection() },
      lines,
      assemblyTier: this.assemblyTier(),
      precisionTuning: this.precisionTuning(),
      shipping,
      payment,
      dispatch: this.shippingOption()?.dispatch ?? '',
      pricing: this.checkout()
    });
    dialog.close();
    snackbar.open();
  }

  public startNewBuild(snackbar: IgxSnackbarComponent): void {
    snackbar.close();
    this.orders.clearLastOrder();
    this.buildState.startNewBuild();
    this.checkoutForm.reset({ shipping: 'ground', payment: null });
    this.router.navigate(['/pc-builder']);
  }
}
