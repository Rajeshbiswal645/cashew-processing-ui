import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilingComponent } from './boiling.component';

describe('BoilingComponent', () => {
  let component: BoilingComponent;
  let fixture: ComponentFixture<BoilingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoilingComponent]
    });
    fixture = TestBed.createComponent(BoilingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
