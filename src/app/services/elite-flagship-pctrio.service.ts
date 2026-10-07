import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomPcBuildsType } from '../models/elite-flagship-pctrio/custom-pc-builds-type';
import { EliteFlagshipPCTrio } from '../static-data/elite-flagship-pctrio';

@Injectable({
  providedIn: 'root'
})
export class EliteFlagshipPCTrioService {
  public getCustomPcBuilds(): Observable<CustomPcBuildsType[]> {
    return of(EliteFlagshipPCTrio['CustomPcBuildsType']);
  }
}
