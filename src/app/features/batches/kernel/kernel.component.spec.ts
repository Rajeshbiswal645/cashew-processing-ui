import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KernelComponent } from './kernel.component';

describe('KernelComponent', () => {
  let component: KernelComponent;
  let fixture: ComponentFixture<KernelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KernelComponent]
    });
    fixture = TestBed.createComponent(KernelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
