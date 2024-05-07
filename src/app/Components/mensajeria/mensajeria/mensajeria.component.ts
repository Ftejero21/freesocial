import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { Chat } from 'src/app/Interface/Chat';
import { Mensaje } from 'src/app/Interface/Mensaje';
import { MensajeEnvio } from 'src/app/Interface/MensajeEnvio';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { LoginService } from 'src/app/Service/Login/login.service';
import { MensajeriaService } from 'src/app/Service/mensajeria/mensajeria.service';

@Component({
  selector: 'app-mensajeria',
  templateUrl: './mensajeria.component.html',
  styleUrls: ['./mensajeria.component.css']
})
export class MensajeriaComponent implements OnInit {
  public chats:Chat[] = []
  public usuario!:Usuario
  public filtro: string = '';
  @ViewChild('emojiPicker', { static: true }) emojiPicker!: ElementRef;
  public chatActual:Chat| null = null;
  nombreImagen: string = '';
  chatIntervalId: any;
  public isDropdownOpen = false;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  public mensajesSeleccionados: Mensaje[] = [];
  public usuarioId!: number;
  cursorPos: number = 0;
  urlImagen: string | ArrayBuffer | null = null;
  private escribiendoSubscription!: Subscription;
  isEscribiendo = false;
  public isReceptorEscribiendo: boolean = false;
  private escribiendoTimeout: any;
  public mensajeNuevo: string = '';
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

  mostrarEmojis: boolean = false;
  mostrarEmoticon: boolean = false;
  private intervalId: any;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef;
  constructor(private mensajeriaService:MensajeriaService,private loginService:LoginService,private activatedRoute: ActivatedRoute) { }



  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.getUser();
      this.loadChatsAndInitialize(params);
    });

  }


  loadChatsAndInitialize(params: any): void {
    this.mensajeriaService.getChats().subscribe({
      next: (chats: Chat[]) => {
        this.chats = chats.map(chat => {
          const mensajesNoLeidos = chat.mensajes.filter(mensaje => !mensaje.leido && mensaje.userId !== this.usuario.id).length;
          const isNew = mensajesNoLeidos > 0;
          return { ...chat, nuevoMensaje: isNew, mensajesNoLeidos: mensajesNoLeidos };
        });
        this.chats = chats;
        this.processParamsAndSetupChat(params);

      },
      error: (error) => {
        console.error('Error al cargar los chats:', error);
      }
    });
  }

  processParamsAndSetupChat(params: any): void {
    if (params['usuarioId'] && params['nombreCompleto'] && params['imagenPerfil'] && params['titular']) {
      const usuarioId = parseInt(params['usuarioId']);
      const existingChatIndex = this.chats.findIndex(chat => chat.userId === usuarioId || chat.receptorId === usuarioId);
      if (existingChatIndex === -1) {
        const newChat: Chat = {
          id: -1,
          userId: -1,
          receptorId: usuarioId,
          nombreCompletoReceptor: params['nombreCompleto'],
          imagenPerfilReceptorBase64: params['imagenPerfil'],
          titularReceptor: params['titular'],
          nuevoMensaje: false,
          mensajesNoLeidos: 0,
          mensajes: []
        };

        this.getUser();
        this.chatActual = newChat;
        this.loadAllChats();
      } else {
        this.chatActual = this.chats[existingChatIndex];
        //this.webSocketService.initializeWebSocketConnection(this.chatActual.id);
        this.seleccionarChat(this.chatActual)

      }
    } else {
      console.log("Parámetros insuficientes para iniciar el chat.");
      this.getUser();
      this.getAllChats();
      this.startChatPolling();
      this.startPolling()
    }
  }

  ngOnChanges() {
    // Observa los cambios en chatActual para reiniciar el polling
    if (this.chatActual && this.chatActual.id) {
      this.startPolling();
    }
  }

  public getUser(){
    this.loginService.obtenerUsuario().subscribe((data:any) =>{
      this.usuario = data;
      this.usuarioId = data.id;
    })
  }

  public buscarChat(): void {
        // Si el filtro está vacío, reinicia el intervalo de recarga
        if (!this.filtro.trim()) {
          this.startChatPolling();
          console.log('Recarga de chats reiniciada');
          return;
      }

      // Si hay texto en el filtro, detiene la recarga automática
      if (this.chatIntervalId) {
          clearInterval(this.chatIntervalId);
          this.chatIntervalId = null;
          console.log('Actualización automática detenida');
      }

      const index = this.chats.findIndex(chat => chat.nombreCompletoReceptor?.toLowerCase().includes(this.filtro.toLowerCase()));

      if (index > -1) {
          const [chatFiltrado] = this.chats.splice(index, 1); // Remueve el chat desde la posición encontrada
          this.chats.unshift(chatFiltrado); // Coloca el chat al principio de la lista
      }
  }


  public getAllChats(): void {
    this.mensajeriaService.getChats().subscribe({
      next: (data: Chat[]) => {
        let nuevosMensajesCount = 0;
        this.chats = data.map(chat => {
          const mensajesNoLeidos = chat.mensajes.filter(mensaje => !mensaje.leido && mensaje.userId !== this.usuario.id).length;
          const isNew = mensajesNoLeidos > 0;

          return { ...chat, nuevoMensaje: isNew, mensajesNoLeidos: mensajesNoLeidos };
          if(isNew){
            setTimeout(() => this.scrollToBottom(), 0);
          }
        });

        this.chats.sort((a, b) => {
          if (a.nuevoMensaje && !b.nuevoMensaje) {
            return -1; // a va antes que b
          }
          if (!a.nuevoMensaje && b.nuevoMensaje) {
            return 1; // b va antes que a
          }
          return 0; // Sin cambios en el orden si ambos tienen o no tienen nuevos mensajes
        });

        // Verifica si el chat actual sigue siendo válido
        if (this.chatActual && !this.chats.some(chat => chat.id === this.chatActual?.id)) {
          if (this.chats.length > 0) {
            this.seleccionarChat(this.chats[0]); // Si el chat actual fue eliminado, selecciona el primero
          } else {
            this.chatActual = null; // No hay chats disponibles
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar los chats:', error);
      }
    });
  }

  public loadAllChats(): void {
    this.mensajeriaService.getChats().subscribe({
      next: (data: Chat[]) => {
        let nuevosMensajesCount = 0;
        console.log(data)
        this.chats = data.map(chat => {
          const mensajesNoLeidos = chat.mensajes.filter(mensaje => !mensaje.leido && mensaje.userId !== this.usuario.id).length;
          const lastMessage = chat.mensajes[chat.mensajes.length - 1];
          const isNew = mensajesNoLeidos > 0; // True si hay mensajes no leídos
          return { ...chat, nuevoMensaje: isNew, mensajesNoLeidos: mensajesNoLeidos };
        });

        this.chats.sort((a, b) => {
          if (a.nuevoMensaje && !b.nuevoMensaje) {
            return -1; // a va antes que b
          }
          if (!a.nuevoMensaje && b.nuevoMensaje) {
            return 1; // b va antes que a
          }
          return 0; // Sin cambios en el orden si ambos tienen o no tienen nuevos mensajes
        });
      },
      error: (error) => {
        console.error('Error al cargar los chats:', error);
      }
    });
  }

  startChatPolling() {
    // Limpia el intervalo anterior si existe
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
    }

    // Inicia un nuevo intervalo
    this.chatIntervalId = setInterval(() => {
      if (!this.isDropdownOpen){
        this.getAllChats();
      }

    }, 4000); // Intervalo de 4 segundos
  }

  startPolling() {
    // Limpia el intervalo anterior si existe
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Inicia un nuevo intervalo
    this.intervalId = setInterval(() => {
      if (this.chatActual && this.chatActual.id) {
        if (!this.isDropdownOpen){
          this.mensajeriaService.getMensajesByChatId(this.chatActual.id).subscribe({
            next: (response) => {
              this.mensajesSeleccionados = response;
             // setTimeout(() => this.scrollToBottom(), 0);
              this.marcarMensajesComoLeidos();
              if (this.chatActual) {
                this.chatActual.mensajes = response;  // Seguro porque ya verificamos que chatActual no es undefined
            }            },
            error: (error) => {
              console.error('Error al obtener mensajes:', error);
            }
          });
        }

      }
    }, 3000); // Intervalo de 3 segundos
  }

  ngOnDestroy() {
    // Limpia el intervalo cuando el componente se destruya
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
    }

  }



  public seleccionarChat(chat: Chat | null): void {
    if (!chat || !chat.mensajes) {
      console.error('No se proporcionaron datos válidos para el chat o los mensajes no están disponibles.');
      return;
    }

    this.chatActual = chat;
    this.chatActual.nuevoMensaje = false;
    this.mensajesSeleccionados = chat.mensajes;
    this.mensajeriaService.resetearContadorMensajes();





    this.cargarMensajes(chat.id).then(() => {
      this.marcarMensajesComoLeidos();

      setTimeout(() => this.scrollToBottom(), 0);
    });
  }


  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  public enviarMensaje(): void {
    if (!this.mensajeNuevo.trim() && !this.urlImagen) {
      return; // No hacer nada si ambos, el mensaje y la imagen, están vacíos
    }

    if (this.chatActual && this.chatActual.receptorId) {
      const mensajeEnvio: MensajeEnvio = {
        receptorId: this.chatActual.receptorId,
        contenido: this.mensajeNuevo,

      };
      if (this.urlImagen) {
        // Extraer solo la parte en base64 de la URL de la imagen
        const base64Content = (this.urlImagen as string).split(',')[1];
        mensajeEnvio.imagenMensajeBase64 = base64Content;
      }

      this.mensajeriaService.enviarMensaje(mensajeEnvio).subscribe({
        next: (respuesta) => {
          // Añadir mensaje a la lista de mensajes del chat actual

          this.mensajeNuevo = ''; // Limpia el input después de enviar
          this.mostrarEmojis = false
          this.mostrarEmoticon = false
          this.urlImagen = null;
          this.fileInputRef.nativeElement.value = ''; // Resetear el input de archivo
          clearTimeout(this.escribiendoTimeout);
          // Actualizar o añadir el chat en la lista de chats
          const index = this.chats.findIndex(c => c.receptorId === this.chatActual?.receptorId);
          if (index !== -1) {
            this.chats[index] = {
              ...this.chats[index],
              mensajes: [...this.chats[index].mensajes, respuesta]
            };
            setTimeout(() => this.scrollToBottom(), 0);
            this.seleccionarChat(this.chatActual)
            this.startPolling();
          } else {
            const nuevoChat = {
              id: respuesta.idChat,  // Asumiendo que el backend retorna el idChat correcto
              userId: this.usuarioId,
              receptorId: this.chatActual?.receptorId,
              nombreCompletoReceptor: this.chatActual?.nombreCompletoReceptor,
              imagenPerfilReceptorBase64: this.chatActual?.imagenPerfilReceptorBase64,
              titularReceptor: this.chatActual?.titularReceptor,
              mensajes: [respuesta],
              mensajesNoLeidos: 0,
              nuevoMensaje: false
            };
            this.chats.unshift(nuevoChat);
            this.seleccionarChat(nuevoChat);
          }



        },
        error: (error) => {
          console.error('Error al enviar el mensaje:', error);
        }
      });
    } else {
      console.error('No se ha seleccionado un chat válido o falta el receptorId');
    }
  }

  private async cargarMensajes(chatId: number): Promise<void> {
    try {
      const response = await this.mensajeriaService.getMensajesByChatId(chatId).toPromise();
      this.mensajesSeleccionados = response;
      // Aquí puedes implementar cualquier lógica adicional después de cargar los mensajes,
      // como marcar los mensajes como leídos si es necesario.
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      // Manejo adecuado de errores, por ejemplo, mostrar una notificación al usuario.
    }
  }

  private marcarMensajesComoLeidos(): void {
    // Filtrar todos los mensajes no leídos enviados por otros usuarios
    const mensajesNoLeidos = this.mensajesSeleccionados
        .filter(m => m.userId !== this.usuarioId && !m.leido);

    // Iterar sobre cada mensaje no leído y marcarlo como leído
    mensajesNoLeidos.forEach(mensaje => {
        this.mensajeriaService.MensajeLeido(mensaje.id).subscribe({
            next: (response) => {
                console.log('Mensaje marcado como leído:', response);
                mensaje.leido = true;
            },
            error: (error) => {
                console.error('Error al marcar mensaje como leído:', error);
            }
        });
    });
}

  public deleteMensaje(mensajeId: number) {
    this.isDropdownOpen = false;
    this.mensajeriaService.deleteMensaje(mensajeId).subscribe({
      next: (response) => {
        const mensaje = this.mensajesSeleccionados.find(m => m.id === mensajeId);
      },
      error: (error) => {
        console.error('Error al eliminar el mensaje', error);
        this.getAllChats();
      }
    });
  }

  toggleEmojiPicker() {
    this.mostrarEmojis = !this.mostrarEmojis;
    this.mostrarEmoticon = !this.mostrarEmoticon;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Verifica primero si emojiPicker está definido y luego si el clic fue fuera del elemento
    if (this.emojiPicker && !this.emojiPicker.nativeElement.contains(event.target)) {
      if (this.mostrarEmojis) {
        this.toggleEmojiPicker();
      }
    }
  }
  actualizarPosicionCursor(event: any) {
    const target = event.target;
    setTimeout(() => {
      this.cursorPos = target.selectionStart; // Actualiza la posición del cursor después de eventos de UI
    }, 0);
  }

  agregarEmojiAlMensaje(emoji: string) {
    const inicio = this.mensajeNuevo.slice(0, this.cursorPos);
    const fin = this.mensajeNuevo.slice(this.cursorPos);
    this.mensajeNuevo = inicio + emoji + fin;
    // Ajusta la posición del cursor para después del emoji
    this.cursorPos += emoji.length;
    setTimeout(() => this.actualizarCursorVisualmente(), 0);
  }

  actualizarCursorVisualmente() {
    const inputElement = document.querySelector('.mensajeInput') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.setSelectionRange(this.cursorPos, this.cursorPos);
    }
  }

  archivoSeleccionado(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.nombreImagen = archivo.name;
      console.log('Archivo seleccionado:', archivo.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.urlImagen = reader.result;
      };
      reader.readAsDataURL(archivo);
    }
  }

  quitarImagen(): void {
    this.urlImagen = null;
    this.nombreImagen = '';
    this.fileInputRef.nativeElement.value = ''; // Resetear el input de archivo
  }




}


