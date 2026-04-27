import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingBatchComponent } from './packing-batch.component';

describe('PackingBatchComponent', () => {
  let component: PackingBatchComponent;
  let fixture: ComponentFixture<PackingBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackingBatchComponent]
    });
    fixture = TestBed.createComponent(PackingBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
