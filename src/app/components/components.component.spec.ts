import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IgxButtonDirective, IgxIconComponent, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IGX_ACCORDION_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { BuildStateService } from '../services/build-state.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';
import { InventoryService } from '../services/inventory.service';
import { ComponentsComponent } from './components.component';

describe('ComponentsComponent', () => {
  let component: ComponentsComponent;
  let fixture: ComponentFixture<ComponentsComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ComponentsComponent, NoopAnimationsModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, IgxButtonDirective, IgxIconComponent, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IGX_ACCORDION_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IgxSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides parts the admin discontinued', () => {
    const total = component.totalPartCount();
    TestBed.inject(FlagshipPCHardwareCatalogService).setDiscontinued('gpu-rx-9070xt-nitro', true);
    expect(component.totalPartCount()).toBe(total - 1);
    expect(component.flagshipPCHardwareCatalogHighEndPcHardware().some(part => part.id === 'gpu-rx-9070xt-nitro')).toBe(false);
  });

  it('shows live stock and refuses out-of-stock parts', () => {
    const inventory = TestBed.inject(InventoryService);
    const buildState = TestBed.inject(BuildStateService);
    const part = TestBed.inject(FlagshipPCHardwareCatalogService).getPartById('gpu-rx-9070xt-nitro')!;
    inventory.update(part.id, { stockQuantity: 0 });
    fixture.detectChanges();
    expect(component.stockStatus(part)).toBe('Out of Stock');
    expect(fixture.nativeElement.textContent).toContain('Out of Stock');

    const snackbar = { open: vi.fn() } as unknown as Parameters<ComponentsComponent['selectForRig']>[1];
    component.selectForRig(part, snackbar);
    expect(buildState.selectedParts().GPU?.id).not.toBe(part.id);
    expect(component.snackbarMessage()).toContain('out of stock');
  });
});
