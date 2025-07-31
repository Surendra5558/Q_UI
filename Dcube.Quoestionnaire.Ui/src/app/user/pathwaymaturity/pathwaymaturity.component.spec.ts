import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwaymaturityComponent } from './pathwaymaturity.component';

describe('PathwaymaturityComponent', () => {
  let component: PathwaymaturityComponent;
  let fixture: ComponentFixture<PathwaymaturityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathwaymaturityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathwaymaturityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
