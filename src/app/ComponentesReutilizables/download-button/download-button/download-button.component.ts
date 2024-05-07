import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.css']
})
export class DownloadButtonComponent implements OnInit {

  @Input() imagenParaDescargar!: string | null;
  @Output() downloadClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }


  public descargarImagen(): void {
    if (this.imagenParaDescargar) {
      this.downloadClicked.emit();
    } else {
      console.error('No hay imagen para descargar');
    }
  }

}
