import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-emoji-picker-component',
  templateUrl: './emoji-picker-component.component.html',
  styleUrls: ['./emoji-picker-component.component.css']
})
export class EmojiPickerComponentComponent implements OnInit {

  @Output() emojiSeleccionado = new EventEmitter<string>();
  mostrarEmojis: boolean = false;
  mostrarEmoticon: boolean = false;
  emojis: string[] = [
    '😀', '😂', '👍', '😍', '🎉', '😎', '😢', '🔥', // Emojis ya existentes
    '🤔', '😁', '😭', '🙌', '🍕', '🚗', '📅', '🏀', // Emociones y objetos comunes
    '💕', '👏', '😜', '🤯', '👻', '🤖', '👾', '🎃', // Emociones divertidas y símbolos de eventos
    '🌍', '🌟', '🔒', '🔑', '🎶', '💧', '🔔', '🎓', // Objetos y símbolos varios
    '🏈', '🍺', '🌈', '🔥', '🌟', '🌙', '☀️', '⚡', // Naturaleza y clima
    '📱', '💻', '🎮', '🕹️', '🖨️', '🖱️', '🖲️', '💾', // Tecnología
    '😇', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', // Emociones de salud y bienestar
    '🧠', '👀', '👂', '👃', '👅', '👄', '👐', '👤', // Partes del cuerpo
    '👶', '👦', '👧', '👨', '👩', '👴', '👵', '🧔', // Personas de diferentes edades
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', // Animales populares
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇'  // Frutas
  ];
  constructor() { }

  ngOnInit(): void {
  }

  agregarEmojiAlMensaje(emoji: string) {
    this.emojiSeleccionado.emit(emoji);
  }

  toggleEmojiPicker() {
    this.mostrarEmojis = !this.mostrarEmojis;
    this.mostrarEmoticon = !this.mostrarEmoticon;
  }

  ocultarEmojis() {
    this.mostrarEmojis = false;
  }
}
