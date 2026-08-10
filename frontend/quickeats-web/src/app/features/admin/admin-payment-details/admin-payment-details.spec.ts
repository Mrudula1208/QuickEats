import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPaymentDetails } from './admin-payment-details';

describe('AdminPaymentDetails', () => {
  let component: AdminPaymentDetails;
  let fixture: ComponentFixture<AdminPaymentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPaymentDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPaymentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
