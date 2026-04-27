import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RcnBatchComponent } from './rcn-batch.component';

describe('RcnBatchComponent', () => {
  let component: RcnBatchComponent;
  let fixture: ComponentFixture<RcnBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RcnBatchComponent]
    });
    fixture = TestBed.createComponent(RcnBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
