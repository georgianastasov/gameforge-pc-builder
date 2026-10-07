import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GamingPcComponentsType } from '../models/enthusiast-gaming-rig-specification/gaming-pc-components-type';
import { EnthusiastGamingRigSpecification } from '../static-data/enthusiast-gaming-rig-specification';

@Injectable({
  providedIn: 'root'
})
export class EnthusiastGamingRigSpecificationService {
  public getGamingPcComponents(): Observable<GamingPcComponentsType[]> {
    return of(EnthusiastGamingRigSpecification['GamingPcComponentsType']);
  }
}
