import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IGX_ACCORDION_DIRECTIVES, IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { HighEndPcHardwareType } from '../models/flagship-pchardware-catalog/high-end-pc-hardware-type';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';

@Component({
  selector: 'app-components',
  imports: [IGX_EXPANSION_PANEL_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_ACCORDION_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IgxButtonDirective, IgxIconComponent, IgxBadgeComponent, IgxSnackbarComponent, RouterLink, FormsModule],
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss']
})
export class ComponentsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  public value?: string;
  public flagshipPCHardwareCatalogHighEndPcHardware: HighEndPcHardwareType[] = [];

  constructor(
    public flagshipPCHardwareCatalogService: FlagshipPCHardwareCatalogService,
  ) {}


  ngOnInit() {
    this.flagshipPCHardwareCatalogService.getHighEndPcHardware().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.flagshipPCHardwareCatalogHighEndPcHardware = data;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
