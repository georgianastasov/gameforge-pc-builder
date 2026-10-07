import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnthusiastGamingRigSpecificationService } from './enthusiast-gaming-rig-specification.service';

describe('EnthusiastGamingRigSpecificationService', () => {
  let service: EnthusiastGamingRigSpecificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EnthusiastGamingRigSpecificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
