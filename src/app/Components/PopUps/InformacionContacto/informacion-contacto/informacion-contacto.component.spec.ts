import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionContactoComponent } from './informacion-contacto.component';

describe('InformacionContactoComponent', () => {
  let component: InformacionContactoComponent;
  let fixture: ComponentFixture<InformacionContactoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionContactoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
