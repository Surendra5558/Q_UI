import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTemplateModalComponent } from './client-template-modal.component';

describe('ClientTemplateModalComponent', () => {
  let component: ClientTemplateModalComponent;
  let fixture: ComponentFixture<ClientTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
