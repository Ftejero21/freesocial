import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorEmoticonosComponentComponent } from './selector-emoticonos-component.component';

describe('SelectorEmoticonosComponentComponent', () => {
  let component: SelectorEmoticonosComponentComponent;
  let fixture: ComponentFixture<SelectorEmoticonosComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectorEmoticonosComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorEmoticonosComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
