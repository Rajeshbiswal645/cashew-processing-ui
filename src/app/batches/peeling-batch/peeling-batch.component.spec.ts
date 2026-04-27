import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeelingBatchComponent } from './peeling-batch.component';

describe('PeelingBatchComponent', () => {
  let component: PeelingBatchComponent;
  let fixture: ComponentFixture<PeelingBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeelingBatchComponent]
    });
    fixture = TestBed.createComponent(PeelingBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
