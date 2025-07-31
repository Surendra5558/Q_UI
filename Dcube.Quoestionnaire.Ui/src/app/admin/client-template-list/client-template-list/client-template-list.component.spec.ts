import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTemplateListComponent } from './client-template-list.component';

describe('ClientTemplateListComponent', () => {
  let component: ClientTemplateListComponent;
  let fixture: ComponentFixture<ClientTemplateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTemplateListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
