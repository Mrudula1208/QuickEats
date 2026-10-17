import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AdminEditMenu } from './admin-edit-menu';

describe('AdminEditMenu', () => {
  let component: AdminEditMenu;
  let fixture: ComponentFixture<AdminEditMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditMenu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEditMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

