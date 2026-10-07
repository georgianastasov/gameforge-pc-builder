import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FlagshipEnthusiastPCBuildService } from './flagship-enthusiast-pcbuild.service';

describe('FlagshipEnthusiastPCBuildService', () => {
  let service: FlagshipEnthusiastPCBuildService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FlagshipEnthusiastPCBuildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
