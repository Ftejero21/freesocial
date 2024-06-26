import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploaderComponentComponent } from './image-uploader-component.component';

describe('ImageUploaderComponentComponent', () => {
  let component: ImageUploaderComponentComponent;
  let fixture: ComponentFixture<ImageUploaderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageUploaderComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
