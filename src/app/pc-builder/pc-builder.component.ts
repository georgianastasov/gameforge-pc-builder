import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent, IgxSwitchComponent } from '@infragistics/igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { PcBuilderSlotsType } from '../models/flagship-enthusiast-pcbuild/pc-builder-slots-type';
import { FlagshipEnthusiastPCBuildService } from '../services/flagship-enthusiast-pcbuild.service';

@Component({
  selector: 'app-pc-builder',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxSwitchComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, IgxSnackbarComponent, FormsModule, RouterLink],
  templateUrl: './pc-builder.component.html',
  styleUrls: ['./pc-builder.component.scss']
})
export class PCBuilderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  public assemblyTier = 'Standard Validation';
  public precisionTuning = false;
  public flagshipEnthusiastPCBuildPcBuilderSlots: PcBuilderSlotsType[] = [];

  constructor(
    public flagshipEnthusiastPCBuildService: FlagshipEnthusiastPCBuildService,
  ) {}


  ngOnInit() {
    this.flagshipEnthusiastPCBuildService.getPcBuilderSlots().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.flagshipEnthusiastPCBuildPcBuilderSlots = data;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public clickResetOptions(): void {
    this.assemblyTier = 'Standard Validation';
    this.precisionTuning = false;
  }
}
