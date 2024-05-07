import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-selector-emoticonos-component',
  templateUrl: './selector-emoticonos-component.component.html',
  styleUrls: ['./selector-emoticonos-component.component.css']
})
export class SelectorEmoticonosComponentComponent implements OnInit {
  emoticonos = ['😀', '😂', '🥰', '😍', '🤔', '😎', '😢', '🥳']; // Agrega más emoticonos según necesites
  @Output() emoticonoSeleccionado = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }



  seleccionarEmoticono(emoticono: string) {
    this.emoticonoSeleccionado.emit(emoticono);
  }

}
