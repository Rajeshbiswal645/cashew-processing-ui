import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilingBatchComponent } from './boiling-batch.component';

describe('BoilingBatchComponent', () => {
  let component: BoilingBatchComponent;
  let fixture: ComponentFixture<BoilingBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoilingBatchComponent]
    });
    fixture = TestBed.createComponent(BoilingBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
