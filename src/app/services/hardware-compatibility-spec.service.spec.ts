import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HardwareCompatibilitySpecService } from './hardware-compatibility-spec.service';

describe('HardwareCompatibilitySpecService', () => {
  let service: HardwareCompatibilitySpecService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HardwareCompatibilitySpecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
