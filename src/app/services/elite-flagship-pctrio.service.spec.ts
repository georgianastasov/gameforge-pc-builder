import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';

describe('EliteFlagshipPCTrioService', () => {
  let service: EliteFlagshipPCTrioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EliteFlagshipPCTrioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
