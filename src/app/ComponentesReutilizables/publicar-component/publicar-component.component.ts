import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Publicacion } from 'src/app/Interface/Publicacion';

@Component({
  selector: 'app-publicar-component',
  templateUrl: './publicar-component.component.html',
  styleUrls: ['./publicar-component.component.css']
})
export class PublicarComponentComponent implements OnInit,OnChanges {

  @Input() contentType: string = '';
  public title: string = '';
  formData: Publicacion | null = null;
  showDateTimeInputs: boolean = false;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contentType']) {
      this.setTitle(changes['contentType'].currentValue);
      this.initializeFormData();
    }

  }

  public limpiarModal():void{
    this.initializeFormData();
    this.showDateTimeInputs = false;
  }

  private setTitle(type: string): void {
    switch (type) {
      case 'multimedia':
        this.title = 'Contenido Multimedia';
        break;
      case 'evento':
        this.title = 'Evento';
        break;
      case 'articulo':
        this.title = 'Escribir Artículo';
        break;
      case 'publicacion':
        this.title = 'Crear Publicación';
        break;
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.formData) {
          this.formData.imagenPublicacionBase64 = e.target.result.split(',')[1];
        }
      };
      reader.readAsDataURL(file);
    }
  }

  toggleDateTimeInputs(): void {
    this.showDateTimeInputs = !this.showDateTimeInputs;
  }

  saveContent(): void {
    // Maneja la lógica de guardado aquí, como enviar los datos a un servidor
    if (this.formData) {
      console.log(this.formData);
    }
  }

  private initializeFormData(): void {
    this.formData = {
      id: 0,  // o algún valor por defecto
      fechaPublicacion: null,
      texto: '',
      titulo: null,
      nombre: '',
      titular: '',
      apellido: '',
      idUser: 0,  // o algún valor por defecto
      imagenPerfil: '',
      likeCount: 0,
      liked: false,
      showComments: false,
      comentarios: [],
      sigueAutor: false,
      imagenPublicacionBase64: ''
    };
  }

}
