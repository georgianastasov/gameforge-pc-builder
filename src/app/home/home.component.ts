import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent } from '@infragistics/igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { CustomPcBuildsType } from '../models/elite-flagship-pctrio/custom-pc-builds-type';
import { EliteFlagshipPCTrioService } from '../services/elite-flagship-pctrio.service';

@Component({
  selector: 'app-home',
  imports: [IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  public eliteFlagshipPCTrioCustomPcBuilds: CustomPcBuildsType[] = [];

  constructor(
    public eliteFlagshipPCTrioService: EliteFlagshipPCTrioService,
  ) {}


  ngOnInit() {
    this.eliteFlagshipPCTrioService.getCustomPcBuilds().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.eliteFlagshipPCTrioCustomPcBuilds = data;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
