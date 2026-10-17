import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminOrderDetails } from './admin-order-details';

describe('AdminOrderDetails', () => {
  let component: AdminOrderDetails;
  let fixture: ComponentFixture<AdminOrderDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrderDetails],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrderDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

