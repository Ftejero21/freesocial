import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonEliminarComponent } from './boton-eliminar.component';

describe('BotonEliminarComponent', () => {
  let component: BotonEliminarComponent;
  let fixture: ComponentFixture<BotonEliminarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotonEliminarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonEliminarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
