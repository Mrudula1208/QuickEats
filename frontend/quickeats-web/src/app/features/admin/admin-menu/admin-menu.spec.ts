import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminMenu } from './admin-menu';

describe('AdminMenu', () => {
  let component: AdminMenu;
  let fixture: ComponentFixture<AdminMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMenu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

