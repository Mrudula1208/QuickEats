import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminAddMenu } from './admin-add-menu';

describe('AdminAddMenu', () => {
  let component: AdminAddMenu;
  let fixture: ComponentFixture<AdminAddMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddMenu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAddMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

