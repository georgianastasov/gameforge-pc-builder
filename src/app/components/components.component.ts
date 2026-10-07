import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IChipSelectEventArgs, IGX_ACCORDION_DIRECTIVES, IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxDialogComponent, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { HardwarePart } from '../models/hardware/hardware-part';
import { BuildStateService } from '../services/build-state.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';
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
  private readonly allParts = inject(FlagshipPCHardwareCatalogService).parts;

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

  public readonly flagshipPCHardwareCatalogHighEndPcHardware = computed(() => filterCatalog(this.allParts, this.criteria()));
  public readonly hasActiveFilters = computed(() => hasActiveCriteria(this.criteria()));
  public readonly totalPartCount = this.allParts.length;

  /** Part the specifications dialog was opened for; `null` when opened from "Platform Specs". */
  public readonly dialogPart = signal<HardwarePart | null>(null);
  public readonly snackbarMessage = signal(DEFAULT_SNACKBAR_MESSAGE);

  public readonly hasQuickFilters = computed(() => this.quickFilters().length > 0);

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

  public resetFilters(): void {
    this.searchTerm.set('');
    this.category.set(undefined);
    this.tier.set(undefined);
    this.platform.set(undefined);
    this.sortBy.set(undefined);
    this.quickFilters.set([]);
  }

  public resetFiltersWithNotice(snackbar: IgxSnackbarComponent): void {
    this.resetFilters();
    this.showSnackbar(snackbar, `Filters cleared. Showing all ${this.totalPartCount} components.`);
  }

  public selectForRig(part: HardwarePart, snackbar: IgxSnackbarComponent): void {
    const replaced = this.buildState.selectedParts()[part.category];
    if (replaced?.id === part.id) {
      this.showSnackbar(snackbar, `${part.name} is already in the ${part.category} slot.`);
      return;
    }
    this.buildState.selectPart(part);
    this.showSnackbar(snackbar, replaced
      ? `${part.name} replaced ${replaced.name} in the ${part.category} slot.`
      : `${part.name} added to the ${part.category} slot.`);
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
