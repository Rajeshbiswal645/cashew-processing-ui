import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KernelBatchComponent } from './kernel-batch.component';

describe('KernelBatchComponent', () => {
  let component: KernelBatchComponent;
  let fixture: ComponentFixture<KernelBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KernelBatchComponent]
    });
    fixture = TestBed.createComponent(KernelBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
