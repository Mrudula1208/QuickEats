import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminReviews } from './admin-reviews';

describe('AdminReviews', () => {
  let component: AdminReviews;
  let fixture: ComponentFixture<AdminReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviews],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
