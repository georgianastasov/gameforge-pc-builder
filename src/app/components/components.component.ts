import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IChipSelectEventArgs, IGX_ACCORDION_DIRECTIVES, IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxDialogComponent, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { map } from 'rxjs';
import { HardwareCategory, HardwarePart, parseSlotParam } from '../models/hardware/hardware-part';
import { STOCK_BADGE_TYPE, StockStatus } from '../models/store/inventory';
import { BuildStateService } from '../services/build-state.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';
import { InventoryService } from '../services/inventory.service';
import { CatalogCriteria, CategoryFilter, filterCatalog, hasActiveCriteria, PlatformFilter, QuickFilterId, SortOption, TierFilter } from './catalog-filters';

const DEFAULT_SNACKBAR_MESSAGE = 'Component added to custom build configuration.';

@Component({
  selector: 'app-components',
  imports: [IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_ACCORDION_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxButtonDirective, IgxIconComponent, IgxBadgeComponent, IgxSnackbarComponent, RouterLink, FormsModule, DecimalPipe],
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly router = inject(Router);
  private readonly inventory = inject(InventoryService);
  /** Parts on sale; discontinued parts are hidden from customers. */
  private readonly allParts = inject(FlagshipPCHardwareCatalogService).parts;

  /** Slot being replaced, from `/components?slot=<slot>`; `null` shows the normal full catalog. */
  public readonly replaceSlot = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(params => parseSlotParam(params.get('slot')))),
    { requireSync: true }
  );
  /** The part currently in the slot being replaced. */
  public readonly replacedPart = computed(() => {
    const slot = this.replaceSlot();
    return slot ? this.buildState.selectedParts()[slot] : null;
  });

  // Filter state. `undefined` keeps each select's App Builder placeholder visible.
  public readonly searchTerm = signal('');
  public readonly category = signal<CategoryFilter | undefined>(undefined);
  public readonly tier = signal<TierFilter | undefined>(undefined);
  public readonly platform = signal<PlatformFilter | undefined>(undefined);
  public readonly sortBy = signal<SortOption | undefined>(undefined);
  public readonly quickFilters = signal<readonly QuickFilterId[]>([]);

  private readonly criteria = computed<CatalogCriteria>(() => ({
    search: this.searchTerm(),
    category: this.category(),
    tier: this.tier(),
    platform: this.platform(),
    quickFilters: this.quickFilters(),
    sort: this.sortBy()
  }));

  public readonly flagshipPCHardwareCatalogHighEndPcHardware = computed(() => filterCatalog(this.allParts(), this.criteria()));
  public readonly hasActiveFilters = computed(() => hasActiveCriteria(this.criteria()));
  public readonly totalPartCount = computed(() => this.allParts().length);
  public readonly stockBadgeType = STOCK_BADGE_TYPE;

  /** Part the specifications dialog was opened for; `null` when opened from "Platform Specs". */
  public readonly dialogPart = signal<HardwarePart | null>(null);
  public readonly snackbarMessage = signal(DEFAULT_SNACKBAR_MESSAGE);

  public readonly hasQuickFilters = computed(() => this.quickFilters().length > 0);

  constructor() {
    // Entering (or leaving) replace mode starts from that slot's category.
    effect(() => {
      const slot = this.replaceSlot();
      untracked(() => this.applyBaseline(slot));
    });
  }

  /** Live warehouse availability, set in the Admin Backoffice. */
  public stockStatus(part: HardwarePart): StockStatus {
    return this.inventory.status(part.id);
  }

  public isOrderable(part: HardwarePart): boolean {
    return this.inventory.isOrderable(part.id);
  }

  public isQuickFilterActive(id: QuickFilterId): boolean {
    return this.quickFilters().includes(id);
  }

  /**
   * Chips are controlled by the `quickFilters` signal: user clicks are
   * cancelled and replayed through state, which flows back via `[selected]`.
   */
  public onQuickFilterChanging(event: IChipSelectEventArgs, id: QuickFilterId | 'all'): void {
    if (!event.originalEvent) {
      return;
    }
    event.cancel = true;
    if (id === 'all') {
      this.quickFilters.set([]);
      return;
    }
    this.quickFilters.update(active => active.includes(id) ? active.filter(f => f !== id) : [...active, id]);
  }

  /** Clears every filter; in replace mode the catalog stays scoped to the slot's category. */
  public resetFilters(): void {
    this.applyBaseline(this.replaceSlot());
  }

  private applyBaseline(slot: HardwareCategory | null): void {
    this.searchTerm.set('');
    this.category.set(slot ?? undefined);
    this.tier.set(undefined);
    this.platform.set(undefined);
    this.sortBy.set(undefined);
    this.quickFilters.set([]);
  }

  public resetFiltersWithNotice(snackbar: IgxSnackbarComponent): void {
    this.resetFilters();
    const slot = this.replaceSlot();
    this.showSnackbar(snackbar, slot
      ? `Filters cleared. Showing all ${this.flagshipPCHardwareCatalogHighEndPcHardware().length} ${slot} options.`
      : `Filters cleared. Showing all ${this.totalPartCount()} components.`);
  }

  public selectForRig(part: HardwarePart, snackbar: IgxSnackbarComponent): void {
    const replaced = this.buildState.selectedParts()[part.category];
    if (replaced?.id === part.id) {
      this.showSnackbar(snackbar, `${part.name} is already in the ${part.category} slot.`);
      return;
    }
    if (!this.isOrderable(part)) {
      this.showSnackbar(snackbar, `${part.name} is out of stock and can't be added right now.`);
      return;
    }
    this.buildState.selectPart(part);
    this.showSnackbar(snackbar, replaced
      ? `${part.name} replaced ${replaced.name} in the ${part.category} slot.`
      : `${part.name} added to the ${part.category} slot.`);
  }

  public isInBuild(part: HardwarePart): boolean {
    return this.buildState.selectedParts()[part.category]?.id === part.id;
  }

  /** Leaves replace mode and returns to the normal full catalog. */
  public exitReplaceMode(): void {
    this.router.navigate(['/components']);
  }

  public openSpecs(dialog: IgxDialogComponent, part: HardwarePart | null): void {
    this.dialogPart.set(part);
    dialog.open();
  }

  public addDialogPart(dialog: IgxDialogComponent, snackbar: IgxSnackbarComponent): void {
    const part = this.dialogPart();
    dialog.close();
    if (part) {
      this.selectForRig(part, snackbar);
    }
  }

  public reviewRig(snackbar: IgxSnackbarComponent): void {
    snackbar.close();
    this.router.navigate(['/pc-builder']);
  }

  private showSnackbar(snackbar: IgxSnackbarComponent, message: string): void {
    this.snackbarMessage.set(message);
    snackbar.open();
  }
}
