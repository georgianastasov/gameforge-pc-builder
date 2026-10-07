import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PcBuilderSlotsType } from '../models/flagship-enthusiast-pcbuild/pc-builder-slots-type';
import { FlagshipEnthusiastPCBuild } from '../static-data/flagship-enthusiast-pcbuild';

@Injectable({
  providedIn: 'root'
})
export class FlagshipEnthusiastPCBuildService {
  public getPcBuilderSlots(): Observable<PcBuilderSlotsType[]> {
    return of(FlagshipEnthusiastPCBuild['PcBuilderSlotsType']);
  }
}
