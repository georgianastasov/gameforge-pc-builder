import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IgxBadgeComponent, IGX_CARD_DIRECTIVES, IgxIconComponent, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IgxButtonDirective, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { BuildSummaryComponent } from './build-summary.component';

describe('BuildSummaryComponent', () => {
  let component: BuildSummaryComponent;
  let fixture: ComponentFixture<BuildSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildSummaryComponent, NoopAnimationsModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, IgxBadgeComponent, IGX_CARD_DIRECTIVES, IgxIconComponent, IGX_LINEAR_PROGRESS_BAR_DIRECTIVES, IgxButtonDirective, IGX_DIALOG_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IgxSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
