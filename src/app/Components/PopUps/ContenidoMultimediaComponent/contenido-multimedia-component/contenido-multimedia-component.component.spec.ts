import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoMultimediaComponentComponent } from './contenido-multimedia-component.component';

describe('ContenidoMultimediaComponentComponent', () => {
  let component: ContenidoMultimediaComponentComponent;
  let fixture: ComponentFixture<ContenidoMultimediaComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContenidoMultimediaComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidoMultimediaComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
