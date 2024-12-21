import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPickerComponentComponent } from './emoji-picker-component.component';

describe('EmojiPickerComponentComponent', () => {
  let component: EmojiPickerComponentComponent;
  let fixture: ComponentFixture<EmojiPickerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmojiPickerComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojiPickerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
