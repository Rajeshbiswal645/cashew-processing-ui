import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingBatcComponent } from './sorting-batc.component';

describe('SortingBatcComponent', () => {
  let component: SortingBatcComponent;
  let fixture: ComponentFixture<SortingBatcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SortingBatcComponent]
    });
    fixture = TestBed.createComponent(SortingBatcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
