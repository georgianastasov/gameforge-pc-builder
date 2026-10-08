import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IgxBadgeComponent, IGX_CARD_DIRECTIVES, IgxIconComponent, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IgxButtonDirective, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { BuildStateService } from '../services/build-state.service';
import { InventoryService } from '../services/inventory.service';
import { OrderService } from '../services/order.service';
import { BuildSummaryComponent } from './build-summary.component';

describe('BuildSummaryComponent', () => {
  let component: BuildSummaryComponent;
  let fixture: ComponentFixture<BuildSummaryComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BuildSummaryComponent, NoopAnimationsModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, IgxBadgeComponent, IGX_CARD_DIRECTIVES, IgxIconComponent, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IgxButtonDirective, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IgxSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  const dialog = () => ({ open: vi.fn(), close: vi.fn() }) as unknown as Parameters<BuildSummaryComponent['confirmOrder']>[0];
  const snackbar = () => ({ open: vi.fn(), close: vi.fn() }) as unknown as Parameters<BuildSummaryComponent['confirmOrder']>[1];

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a customer name before placing the order', () => {
    const orders = TestBed.inject(OrderService);
    const before = orders.orders().length;
    component.checkoutForm.patchValue({ customerName: '   ', payment: 'card' });
    component.confirmOrder(dialog(), snackbar());
    expect(orders.orders().length).toBe(before);
    expect(component.checkoutForm.controls.customerName.invalid).toBe(true);
  });

  it('records the customer name on the order shown in the Backoffice history', () => {
    const orders = TestBed.inject(OrderService);
    component.checkoutForm.patchValue({ customerName: '  Jordan Lee ', payment: 'purchase-order' });
    component.confirmOrder(dialog(), snackbar());
    const [latest] = orders.orders();
    expect(latest).toMatchObject({ customerName: 'Jordan Lee', paymentStatus: 'Pre-Authorized', fulfillmentStatus: 'Assembly & Testing' });
    expect(component.confirmedOrder()?.id).toBe(latest.id);
  });

  it('blocks ordering while a selected part is out of stock', () => {
    const psu = TestBed.inject(BuildStateService).selectedParts().PSU!;
    TestBed.inject(InventoryService).update(psu.id, { stockQuantity: 0 });
    expect(component.canOrder()).toBe(false);
    expect(component.orderBlockReason()).toContain(`${psu.name} (out of stock)`);
  });
});
