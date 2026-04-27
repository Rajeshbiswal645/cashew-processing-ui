import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RcnComponent } from './rcn.component';

describe('RcnComponent', () => {
  let component: RcnComponent;
  let fixture: ComponentFixture<RcnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RcnComponent]
    });
    fixture = TestBed.createComponent(RcnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
