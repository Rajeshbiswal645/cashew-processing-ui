import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDetailComponent } from './batch-detail.component';

describe('BatchDetailComponent', () => {
  let component: BatchDetailComponent;
  let fixture: ComponentFixture<BatchDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BatchDetailComponent]
    });
    fixture = TestBed.createComponent(BatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
