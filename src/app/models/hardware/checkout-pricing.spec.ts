import { calculatePricing } from './build-pricing';
import { calculateCheckout } from './checkout-pricing';

describe('calculateCheckout', () => {
  it('reproduces the App Builder invoice: $2,849 + $49 testing, 6.5% tax, free ground freight', () => {
    const checkout = calculateCheckout(calculatePricing(2849, 'Precision Stress-Testing', false), 'ground', 'card');
    expect(checkout.servicesFee).toBe(49);
    expect(checkout.tax).toBe(188.37);
    expect(checkout.shippingFee).toBe(0);
    expect(checkout.finalTotal).toBe(3086.37);
  });

  it('adds shipping without taxing or discounting it', () => {
    const base = calculatePricing(1000, 'Standard Validation', false);
    expect(calculateCheckout(base, 'express', 'card').finalTotal).toBe(1000 + 65 + 65);
    expect(calculateCheckout(base, 'white-glove', 'card').finalTotal).toBe(1000 + 65 + 140);
  });

  it('applies the 1.5% wire transfer discount before tax', () => {
    const checkout = calculateCheckout(calculatePricing(1000, 'Standard Validation', true), 'ground', 'ach');
    // Hardware $1,000 + tuning $79 = $1,079; discount $16.19; tax 6.5% of $1,062.81 = $69.08.
    expect(checkout.paymentDiscount).toBe(16.19);
    expect(checkout.tax).toBe(69.08);
    expect(checkout.finalTotal).toBe(1131.89);
  });

  it('treats unselected shipping and payment as no fee and no discount', () => {
    const checkout = calculateCheckout(calculatePricing(500, 'Standard Validation', false), null, null);
    expect(checkout.shippingFee).toBe(0);
    expect(checkout.paymentDiscount).toBe(0);
    expect(checkout.finalTotal).toBe(532.5);
  });
});
