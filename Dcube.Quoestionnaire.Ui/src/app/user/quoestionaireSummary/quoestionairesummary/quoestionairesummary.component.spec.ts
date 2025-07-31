import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoestionairesummaryComponent } from './quoestionairesummary.component';

describe('QuoestionairesummaryComponent', () => {
  let component: QuoestionairesummaryComponent;
  let fixture: ComponentFixture<QuoestionairesummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoestionairesummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoestionairesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
