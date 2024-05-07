import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponentsComponent } from './alert-components.component';

describe('AlertComponentsComponent', () => {
  let component: AlertComponentsComponent;
  let fixture: ComponentFixture<AlertComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
