import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminAddRestaurant } from './admin-add-restaurant';

describe('AdminAddRestaurant', () => {
  let component: AdminAddRestaurant;
  let fixture: ComponentFixture<AdminAddRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddRestaurant],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAddRestaurant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

