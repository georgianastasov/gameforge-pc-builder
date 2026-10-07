import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HardwareCompatibilitySpecType } from '../models/hardware-compatibility-spec/hardware-compatibility-spec-type';
import { HardwareCompatibilitySpec } from '../static-data/hardware-compatibility-spec';

@Injectable({
  providedIn: 'root'
})
export class HardwareCompatibilitySpecService {
  public getHardwareCompatibilitySpec(): Observable<HardwareCompatibilitySpecType[]> {
    return of(HardwareCompatibilitySpec['HardwareCompatibilitySpecType']);
  }
}
