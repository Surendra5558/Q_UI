import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityreportComponent } from './securityreport.component';

describe('SecurityreportComponent', () => {
  let component: SecurityreportComponent;
  let fixture: ComponentFixture<SecurityreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
