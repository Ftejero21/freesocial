import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contenido-multimedia-component',
  templateUrl: './contenido-multimedia-component.component.html',
  styleUrls: ['./contenido-multimedia-component.component.css']
})
export class ContenidoMultimediaComponentComponent implements OnInit {
  @Input() imagenSrc: string = '';
  mostrarPopup: boolean = false;

  constructor(){}

  ngOnInit(): void {
    
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  abrirPopup(): void {
    this.mostrarPopup = true;
  }

}
