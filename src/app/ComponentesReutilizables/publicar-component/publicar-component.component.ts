import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-publicar-component',
  templateUrl: './publicar-component.component.html',
  styleUrls: ['./publicar-component.component.css']
})
export class PublicarComponentComponent implements OnInit {

  title: string = '';
  content: string = '';
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  public updateModalContent(type: string): void {
    switch (type) {
      case 'multimedia':
        this.title = 'Contenido Multimedia';
        this.content = 'Aquí puedes subir imágenes, videos, etc.';
        break;
      case 'evento':
        this.title = 'Evento';
        this.content = 'Crear un evento aquí.';
        break;
      case 'articulo':
        this.title = 'Escribir Artículo';
        this.content = "escribe un articulo"
        break;
      case 'publicacion':
        this.title = 'Crear Publicación';
        this.content = 'Escribe una publicación rápida aquí.';
        break;
    }
  }



}
