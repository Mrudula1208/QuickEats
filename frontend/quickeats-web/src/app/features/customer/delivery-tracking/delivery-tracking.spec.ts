import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { DeliveryTrackingComponent } from './delivery-tracking';

describe('DeliveryTrackingComponent', () => {
  let component: DeliveryTrackingComponent;
  let fixture: ComponentFixture<DeliveryTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryTrackingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryTrackingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

