import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientquoestionnaireComponent } from './clientquoestionnaire.component';

describe('ClientquoestionnaireComponent', () => {
  let component: ClientquoestionnaireComponent;
  let fixture: ComponentFixture<ClientquoestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientquoestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientquoestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
