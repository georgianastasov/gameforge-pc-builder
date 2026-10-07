import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HighEndPcHardwareType } from '../models/flagship-pchardware-catalog/high-end-pc-hardware-type';
import { FlagshipPCHardwareCatalog } from '../static-data/flagship-pchardware-catalog';

@Injectable({
  providedIn: 'root'
})
export class FlagshipPCHardwareCatalogService {
  public getHighEndPcHardware(): Observable<HighEndPcHardwareType[]> {
    return of(FlagshipPCHardwareCatalog['HighEndPcHardwareType']);
  }
}
