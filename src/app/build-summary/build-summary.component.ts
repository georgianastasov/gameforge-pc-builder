import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_CARD_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { IgcGridLite } from 'igniteui-grid-lite';
import { defineComponents } from 'igniteui-webcomponents';
import { Subject, takeUntil } from 'rxjs';
import { GamingPcComponentsType } from '../models/enthusiast-gaming-rig-specification/gaming-pc-components-type';
import { HardwareCompatibilitySpecType } from '../models/hardware-compatibility-spec/hardware-compatibility-spec-type';
import { EnthusiastGamingRigSpecificationService } from '../services/enthusiast-gaming-rig-specification.service';
import { HardwareCompatibilitySpecService } from '../services/hardware-compatibility-spec.service';

defineComponents(IgcGridLite);

@Component({
  selector: 'app-build-summary',
  imports: [IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxBadgeComponent, IgxIconComponent, IgxButtonDirective, IgxSnackbarComponent, RouterLink, FormsModule],
  templateUrl: './build-summary.component.html',
  styleUrls: ['./build-summary.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuildSummaryComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  public value = '1';
  public value1 = '1';
  public enthusiastGamingRigSpecificationGamingPcComponents: GamingPcComponentsType[] = [];
  public hardwareCompatibilitySpecHardwareCompatibilitySpec: HardwareCompatibilitySpecType[] = [];

  constructor(
    public enthusiastGamingRigSpecificationService: EnthusiastGamingRigSpecificationService,
    public hardwareCompatibilitySpecService: HardwareCompatibilitySpecService,
  ) {}


  ngOnInit() {
    this.enthusiastGamingRigSpecificationService.getGamingPcComponents().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.enthusiastGamingRigSpecificationGamingPcComponents = data;
        this.changeDetectorRef.markForCheck();
      }
    );
    this.hardwareCompatibilitySpecService.getHardwareCompatibilitySpec().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.hardwareCompatibilitySpecHardwareCompatibilitySpec = data;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
