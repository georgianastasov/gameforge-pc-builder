import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

describe('FlagshipPCHardwareCatalogService', () => {
  let service: FlagshipPCHardwareCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FlagshipPCHardwareCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
