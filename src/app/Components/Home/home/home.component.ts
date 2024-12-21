import { Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/Service/Login/login.service';
import { ErrorService } from 'src/app/Service/Error/error.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { PublicacionesService } from 'src/app/Service/Publicaciones/publicaciones.service';
import { Publicacion } from 'src/app/Interface/Publicacion';
import { Filtro } from 'src/app/Interface/Filtro';
import { Subject, Subscription, debounceTime, interval, timer } from 'rxjs';
import { LikeService } from 'src/app/Service/LikeService/like.service';
import { Comentario } from 'src/app/Interface/Comentario';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PublicarComponentComponent } from 'src/app/ComponentesReutilizables/publicar-component/publicar-component.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],


})
export class HomeComponent implements OnInit,OnDestroy {
  public usuario!:Usuario
  public publicaciones:Publicacion[] = []
  public filtro: Filtro = { fechaPublicacion: null };
  pagina: number = 0;
  iconClass = 'bi bi-hand-thumbs-up';
  iconColor = 'black';
  tamano: number = 10;
  public contentType: string = '';
  commentCount:number = 0;
  public mostrarRespuestas: { [comentarioId: number]: boolean } = {};
  public comentarios: Comentario[] = [];
  public comentarioVisibleId: number | null = null;
  private totalElements: number = 0;
  private loadedElements: number = 0;
  public showComments: boolean = false;
  isLoading: boolean = false;
  previewUrl: SafeUrl | null = null;
  private checkSub!: Subscription;
  showNewPublicationsButton: boolean = false;
  isLoadingNew: boolean = false;
  public textoComentario: string = '';
  public textoRespuesta:string = '';
  public datosCargados: boolean = false;
  public comentariosPorPublicacion: { [key: number]: Comentario[] } = {};
  private scrollEvents = new Subject<Event>();
  constructor(private loginService: LoginService,private errorService: ErrorService, private router: Router,private publicacionService:PublicacionesService,private likeService:LikeService, private renderer: Renderer2,public sanitizer: DomSanitizer) {
    this.scrollEvents.pipe(
      debounceTime(300)  // Ajusta este valor si es necesario
    ).subscribe((event: Event) => this.onScroll(event));
  }

  ngOnInit(): void {
     this.getUser();
     this.setupPeriodicCheck();
     this.getPublicaciones();

  }

  ngOnDestroy() {
    if (this.checkSub) {
      this.checkSub.unsubscribe();
    }
  }

  public handleCambioSeguir(event: { userId: number, sigueAutor: boolean }) {
    this.publicaciones.forEach(pub => {
      if (pub.idUser === event.userId) {
        pub.sigueAutor = event.sigueAutor;
      }
    });
  }

  public openModal(type: string): void {
    this.contentType = type;
  }

  setupPeriodicCheck() {
    if (this.checkSub) {
      this.checkSub.unsubscribe();
    }
    this.checkSub = interval(5000).subscribe(() => {
      const filtro: Filtro = {
        pagina: 0,
        tamano: this.totalElements + 10
      };
      this.publicacionService.getPublicaciones(filtro).subscribe(data => {
        if (data.content) {
          data.content.forEach((updatedPublication: Publicacion) => {
            const existingPub = this.publicaciones.find(pub => pub.id === updatedPublication.id);
            if (existingPub) {
              existingPub.comentarios = updatedPublication.comentarios;
              existingPub.fechaPublicacion = updatedPublication.fechaPublicacion;
              existingPub.likeCount = updatedPublication.likeCount;

               // Actualizar comentarios y respuestas
            updatedPublication.comentarios.forEach(updatedComment => {
              const existingComment = existingPub.comentarios.find(c => c.id === updatedComment.id);
              if (existingComment) {
                // Actualizar los detalles del comentario
                existingComment.texto = updatedComment.texto;

                // Actualizar respuestas en el comentario
                updatedComment.respuestas?.forEach(updatedResponse => {
                  const existingResponse = existingComment.respuestas?.find(r => r.id === updatedResponse.id);
                  if (existingResponse) {
                    existingResponse.texto = updatedResponse.texto;
                  } else {
                    existingComment.respuestas?.push(updatedResponse);
                  }
                });
              } else {
                existingPub.comentarios.push(updatedComment);
              }
            });
            }
          });
        }

        if (data.totalElements > this.totalElements) {
          this.showNewPublicationsButton = true; // Mostrar botón de nuevas publicaciones si hay más elementos
        }
      });
    });
  }


  public getUser(){
    this.datosCargados = false
    this.loginService.obtenerUsuario().subscribe((data:any) =>{
      this.usuario = data;
      setTimeout(() => {
        this.datosCargados = true;
      }, 1000);
    })
  }

  getNewsPublicaciones() {
    this.isLoadingNew = true;
    this.showNewPublicationsButton = false;
    this.publicaciones = []
    window.scrollTo(0, 0);
    const filtro: Filtro = {
      pagina: 0,
      tamano: this.totalElements + 10
    };
    this.publicacionService.getPublicaciones(filtro).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.isLoadingNew = false;
          this.publicaciones = data.content;
          this.publicaciones.forEach(pub => pub.showComments = false);
          this.totalElements = data.totalElements;
        }, 2000);
      },
      error: (error) => {
        console.error('Error al obtener publicaciones', error);
        this.isLoadingNew = false; // Desactivar el nuevo spinner en caso de error
      }
    });
  }

  darLike(publicacion: Publicacion, event: any) {
    const iconElement = event.target;  // Obtiene el elemento del ícono
    const buttonElement = event.target.closest('button'); // Obtiene el botón que contiene el ícono

    this.likeService.darLike(publicacion.id).subscribe({
      next: (response) => {
        publicacion.liked = !publicacion.liked;
        if (publicacion.liked) {
          publicacion.likeCount += 1; // Incrementa el contador de likes
        } else {
          publicacion.likeCount -= 1; // Decrementa el contador de likes
        }
        if (publicacion.liked) {
          // Cambiar el color del texto del ícono y del botón a #0a66c2 cuando se da like
          this.renderer.setStyle(iconElement, 'color', '#0a66c2');
          this.renderer.setStyle(buttonElement, 'color', '#0a66c2');
        } else {
          // Cambiar el color del texto del ícono y del botón a negro cuando se quita el like
          this.renderer.setStyle(iconElement, 'color', 'black');
          this.renderer.setStyle(buttonElement, 'color', 'black');
        }
      },
      error: (error) => {
        console.error('Error al dar like', error);
      }
    });
  }

  public getPublicaciones() {
    if (this.isLoading) return; // Evita múltiples cargas simultáneas
    this.isLoading = true;

    const filtro: Filtro = {
      fechaPublicacion: null, // o cualquier filtro que estés aplicando
      pagina: this.pagina,
      tamano: this.tamano
    };

    this.publicacionService.getPublicaciones(filtro).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.isLoading = false;

        }, 1000);

        this.publicaciones = [...this.publicaciones, ...data.content]; // Concatena nuevas publicaciones
        this.pagina++;
        this.publicaciones.forEach(pub => pub.showComments = false); // Inicializar aquí

        this.loadedElements += data.content.length;
        this.totalElements = data.totalElements;


      },
      error: (error) => {
        console.error('Error al obtener publicaciones', error);
        this.isLoading = false; // Asegura que el indicador de carga se oculte en caso de error
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  handleScroll(event: Event) {
    this.scrollEvents.next(event);
  }


  onScroll(event: Event) {
    const threshold = 500;  // Umbral para empezar a cargar más contenido
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;

    // Verifica si ya has alcanzado o superado el total de elementos disponibles
    if (position > height - threshold && this.publicaciones.length < this.totalElements) {
      this.getPublicaciones();
    }
  }

  toggleComments(publicacion: Publicacion): void {
    publicacion.showComments = !publicacion.showComments;
}

  submitComentario(publicacionId: number) {
    if (this.textoComentario.trim()) {
      const nuevoComentario: Comentario = {
        id: null, // Se asume que no necesitas enviar esto
        texto: this.textoComentario,
        nombreCompleto: null, // Ajusta según tus necesidades
        fechaCreacion: null, // o deja que el backend maneje esto
        imagenPerfilBase64: null, // Si es necesario
        titular: null // Ajusta según tus necesidades
      };

      this.publicacionService.createComentario(nuevoComentario, publicacionId).subscribe({
        next: (response) => {
          this.agregarComentarioAPublicacion(response, publicacionId);
          this.textoComentario = ''; // Limpiar el campo de texto después de enviar
        },
        error: (error) => console.error('Error al crear el comentario:', error)
      });
    } else {
      console.error('El comentario no puede estar vacío');
    }
  }

  private agregarComentarioAPublicacion(comentario: Comentario, publicacionId: number) {
    // Encuentra la publicación por ID y actualiza el array de comentarios
    const publicacion = this.publicaciones.find(pub => pub.id === publicacionId);
    if (publicacion) {
      comentario['isNew'] = true;
        publicacion.comentarios.unshift(comentario);

        // Remover la propiedad después de que la animación haya terminado
        setTimeout(() => {
            delete comentario['isNew'];
        }, 500);
    }
  }

  openFileChooser() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  // Método que se ejecuta cuando se selecciona un archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.previewUrl = null; // Esto quitará la imagen del DOM
  }

  toggleRespuestas(comentario: Comentario): void {
    // Si ya están en true, los ponemos en false y viceversa.
    const newState = !comentario.escribiendoRespuesta;

    comentario.escribiendoRespuesta = newState;
    comentario.mostrarRespuestas = newState;

    if (newState) {
      // Si se va a escribir una respuesta, detenemos el intervalo
      if (this.checkSub) {
          this.checkSub.unsubscribe(); // Detener el intervalo
          console.log('Intervalo detenido');
      }
      comentario.textoRespuesta = ""; // Limpiar el campo cuando se abre el formulario
    } else {
        // Si se cierra el formulario de respuesta, reiniciamos el intervalo
        this.setupPeriodicCheck(); // Reiniciar la verificación periódica
        console.log('Intervalo reiniciado');
    }
  }

  submitRespuesta(comentarioId: number): void {

    const nuevaRespuesta: Comentario = {
      texto: this.textoRespuesta,
      // Asegúrate de que las demás propiedades necesarias para la creación de la respuesta estén aquí
    };

    // Llamar al servicio para enviar la respuesta
    this.publicacionService.createRespuesta(nuevaRespuesta, comentarioId).subscribe({
      next: (respuestaCreada) => {
        this.textoRespuesta = ''

        this.actualizarComentarioConRespuesta(respuestaCreada);
        this.setupPeriodicCheck();
      },
      error: (error) => {
        console.error('Error al crear la respuesta', error);
      }
    });
  }

  private actualizarComentarioConRespuesta(respuesta: Comentario): void {
    for (let publicacion of this.publicaciones) {
      // Encuentra el comentario padre usando comentarioPadreId
      const comentarioPadre = publicacion.comentarios.find(c => c.id === respuesta.comentarioPadreId);
      if (comentarioPadre) {
        // Asegura que la lista de respuestas esté inicializada
        comentarioPadre.respuestas = comentarioPadre.respuestas || [];
        comentarioPadre.escribiendoRespuesta = false
        comentarioPadre.respuestas.push(respuesta);
        break; // Salir del bucle una vez actualizado
      }
    }
  }







}


