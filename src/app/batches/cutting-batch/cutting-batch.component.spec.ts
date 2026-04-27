import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuttingBatchComponent } from './cutting-batch.component';

describe('CuttingBatchComponent', () => {
  let component: CuttingBatchComponent;
  let fixture: ComponentFixture<CuttingBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CuttingBatchComponent]
    });
    fixture = TestBed.createComponent(CuttingBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
