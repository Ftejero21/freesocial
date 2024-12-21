import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmojiPickerComponentComponent } from 'src/app/ComponentesReutilizables/EmojiPickerComponent/emoji-picker-component/emoji-picker-component.component';
import { Chat } from 'src/app/Interface/Chat';
import { Mensaje } from 'src/app/Interface/Mensaje';
import { MensajeEnvio } from 'src/app/Interface/MensajeEnvio';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { LoginService } from 'src/app/Service/Login/login.service';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';
import { MensajeriaService } from 'src/app/Service/mensajeria/mensajeria.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserStatus } from 'src/app/Interface/UserStatus';
import { connect, createLocalTracks, Room } from 'twilio-video';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { utils } from 'src/app/Utils/utils';
import { AppComponent } from 'src/app/app.component';
import { TwilioVideoService } from 'src/app/Service/twilio-video/twilio-video.service';
import { ChatGrupal } from 'src/app/Interface/ChatGrupal';
import { MensajeEnvioGrupal } from 'src/app/Interface/MensajeEnvioGrupal';
import { MensajeGrupalDTO } from 'src/app/Interface/MensajeGrupalDTO';

@Component({
  selector: 'app-mensajeria',
  templateUrl: './mensajeria.component.html',
  styleUrls: ['./mensajeria.component.css']
})
export class MensajeriaComponent implements OnInit, OnDestroy {
  public chats:Chat[] = []
  public usuario!:Usuario
  public filtro: string = '';
  public chatsGrupales: ChatGrupal[] = [];
  mostrarReaccion: boolean = false ;
  originalContent!: string;
  mensajesIndividualesPendientes: number = 0;
  mensajeEnEdicion: MensajeEnvio | null = null;
  @ViewChild(EmojiPickerComponentComponent) emojiPicker!: EmojiPickerComponentComponent;
  public chatActual:Chat| null = null;
  public nombreImagen: string = '';
  chatIntervalId: any;
  public isDropdownOpen = false;
  private saludoSubscription!: Subscription;
  isPdf: boolean = false;
  mensajeSeleccionado: number | null = null;
  reacciones = ['😀', '😂', '😍', '😢', '👍', '👎'];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  public mensajesSeleccionados: Mensaje[] = [];
  public usuarioId!: number;
  cursorPos: number = 0;
  nombreArchivo:string = '';
  urlImagen: string | ArrayBuffer | null = null;
  private mensajeEnviado: boolean = false;
  urlArchivo: SafeResourceUrl | null = null;
  isEscribiendo = false;
  public isReceptorEscribiendo: boolean = false;
  private escribiendoTimeout: any;
  public mensajeNuevo: string = '';
  private subscriptions: Map<string, Subscription> = new Map<string, Subscription>();
  private currentTopic: string | null = null;
  private intervalId: any;
  usuarioConectado: boolean = false;
  public chatActualGrupal: ChatGrupal | null = null;  // Variable para el chat grupal actual
  public mensajesSeleccionadosGrupales: MensajeGrupalDTO[] = [];
  userStatus?: UserStatus;
  private userId!: number | null;
  private statusSubscription: Subscription | undefined;
  originalHeight!: string;
  originalWidth!: string;
  usuarioAusente: boolean = false;
  public esBorrador: boolean = false;
  mensajesContabilizados: Set<number> = new Set();
  ausenciaTimeout: any;
  intervaloChatsGrupalesId:any;
  tiempoAusencia: number = 5000;
  private intervaloMensajesGrupalesId: any;
  public isMuted: boolean = false;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef;
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;
  enLlamada: boolean = false;
  room: Room | null = null;
  nombreEscribiendoGrupal: string = ''; // Para mostrar quién está escribiendo
  currentGroupTopic: string | null = null;
  public isRemoteMuted: boolean = false;
  private inviteSubscription!: Subscription;
  private localStream: MediaStream | null = null;
  mostrarChatsIndividuales: boolean = true;
  constructor(private mensajeriaService:MensajeriaService,private loginService:LoginService,private activatedRoute: ActivatedRoute,
    private webSocketService: WebSocketService,private sanitizer: DomSanitizer,private http: HttpClient,private Utils:utils,private twilioService:TwilioVideoService) { }



  ngOnInit(): void {
    this.webSocketService.connect();

    this.obtenerChatsGrupales();
    this.intervaloMensajesGrupales();
    this.activatedRoute.queryParams.subscribe(params => {
      this.getUser();
      this.loadChatsAndInitialize(params);

    });
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.conectarUsuario(true);

  }


  private playSound(): void {
    const audio = new Audio('assets/sonido.mp3');
    audio.play();
  }

  public cambiarAVistaIndividual(): void {
    this.mostrarChatsIndividuales = true;
    clearInterval(this.intervalId); // Detener el intervalo
    this.mensajesIndividualesPendientes = 0;
    this.mensajesContabilizados.clear();
    this.chatActualGrupal = null

    if (this.chatActual) {
      this.marcarMensajesComoLeidos();
    }
  }

  public cambiarAVistaGrupal(): void {
    this.mostrarChatsIndividuales = false;
    this.chatActual = null;
    this.iniciarIntervaloMensajesNoLeidos();
    this.obtenerChatsGrupales();
  }

  public detectarMensajesNoLeidos(): void {
    this.mensajeriaService.getChats().subscribe({
      next: (chats: any[]) => {
        let nuevosMensajesCount = 0;

        chats.forEach(chat => {
          const lastMessage = chat.mensajes[chat.mensajes.length - 1];

          if (lastMessage && !lastMessage.leido && lastMessage.userId !== this.usuario.id) {
            nuevosMensajesCount++;
          }
        });

        // Llamar a playSound() si hay un incremento en los mensajes no leídos
        if (nuevosMensajesCount > this.mensajesIndividualesPendientes) {
          this.playSound();
        }

        // Actualizar el contador
        this.mensajesIndividualesPendientes = nuevosMensajesCount;
      },
      error: (error) => {
        console.error('Error al obtener los chats individuales:', error);
      }
    });
  }


  public iniciarIntervaloMensajesNoLeidos(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.detectarMensajesNoLeidos();
    }, 3000); // Intervalo de 3 segundos
  }




  public iniciarIntervaloChatsGrupales(): void {
    // Limpiar el intervalo anterior si ya existe
    if (this.intervaloChatsGrupalesId) {
      clearInterval(this.intervaloChatsGrupalesId);
    }

    // Iniciar un nuevo intervalo de 3 segundos
    this.intervaloChatsGrupalesId = setInterval(() => {
      this.obtenerChatsGrupales(); // Llama a la función para obtener los chats grupales
    }, 3000);
  }


  toggleMute(): void {
    this.isMuted = !this.isMuted;

    if (this.room) {
        this.room.localParticipant.audioTracks.forEach(publication => {
            if (this.isMuted) {
                publication.track.disable(); // Silencia el micrófono
            } else {
                publication.track.enable(); // Activa el micrófono
            }
        });

        // Enviar notificación al otro usuario
        const muteStatus = {
            userId: this.usuario.id, // userId es un Long
            muted: this.isMuted
        };
        console.log(muteStatus)
        this.webSocketService.rxStomp.publish({
            destination: '/app/muteStatus',
            body: JSON.stringify(muteStatus)
        });
    }
  }

  updateRemoteMuteStatus(isMuted: boolean): void {
    this.isRemoteMuted = isMuted;
    console.log('El otro usuario está silenciado:', isMuted);
  }

  suscribirseAlMuteStatus(): void {
    if (this.chatActual && this.chatActual.userId) {
        const topic = '/topic/muteStatus.' + this.chatActual.receptorId;
        this.webSocketService.rxStomp.watch(topic).subscribe((message: any) => {
            const muteStatus = JSON.parse(message.body);
            console.log(muteStatus)
            if (muteStatus.userId === this.chatActual?.receptorId) {
                this.updateRemoteMuteStatus(muteStatus.muted);
            }
        });
    }
  }


  joinRoom(token: string, roomName: string): void {
    connect(token, { name: roomName }).then(room => {
      this.room = room;
      this.enLlamada = true;
      this.showLocalVideoTrack();

      room.on('participantConnected', participant => {
        this.handleParticipant(participant);
      });

      room.participants.forEach(participant => {
        this.handleParticipant(participant);
      });

      room.on('participantDisconnected', participant => {
      });

      room.on('disconnected', () => {
        this.enLlamada = false;
      });
    }, error => {
      console.error('Error conectando a la sala:', error);
    });
  }

  public obtenerChatsGrupales(): void {
    this.mensajeriaService.obtenerChatsGrupales().subscribe(
      (chats: ChatGrupal[]) => {
        this.chatsGrupales = chats;
        console.log(this.chatsGrupales)
      },
      (error) => {
        console.error('Error al obtener los chats grupales:', error);
      }
    );
  }

  showLocalVideoTrack(): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      if (this.localVideo && this.localVideo.nativeElement) {
          const videoElement = this.localVideo.nativeElement;
          videoElement.srcObject = stream;

          videoElement.onloadedmetadata = () => {
              videoElement.play().catch(error => {
                  console.error('Error al intentar reproducir el video local:', error);
              });
          };
      } else {
          console.error('Elemento de video local no está disponible');
      }
  }).catch(error => {
      console.error('Error al obtener el stream de video y audio:', error);
  });
  }

  handleParticipant(participant: any): void {
    participant.on('trackSubscribed', (track: any) => {
      this.attachTrack(track);
    });

    participant.tracks.forEach((publication: any) => {
      if (publication.track) {
        this.attachTrack(publication.track);
      }
    });
  }

  attachTrack(track: any): void {
    if (track.kind === 'video') {
      if (this.remoteVideo && this.remoteVideo.nativeElement) {
          const videoElement = this.remoteVideo.nativeElement;
          videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);

          videoElement.onloadedmetadata = () => {
              videoElement.play().catch(error => {
                  console.error('Error al intentar reproducir el video remoto:', error);
              });
          };
      } else {
          console.error('Elemento de video remoto no está disponible');
      }
  }
  }


  public colgarLlamada(): void {
    if (this.room) {
      this.room.disconnect(); // Desconecta de la sala
      this.enLlamada = false;
      if (this.saludoSubscription) {
        this.saludoSubscription.unsubscribe();
      }
    }
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
        this.seleccionarChat(this.chatActual)

      }
    } else {
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
          return;
      }

      // Si hay texto en el filtro, detiene la recarga automática
      if (this.chatIntervalId) {
          clearInterval(this.chatIntervalId);
          this.chatIntervalId = null;
      }

      const index = this.chats.findIndex(chat => chat.nombreCompletoReceptor?.toLowerCase().includes(this.filtro.toLowerCase()));

      if (index > -1) {
          const [chatFiltrado] = this.chats.splice(index, 1); // Remueve el chat desde la posición encontrada
          this.chats.unshift(chatFiltrado); // Coloca el chat al principio de la lista
      }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.mensajeSeleccionado != null && !target.closest('.popup-reaccion')) {
      this.cerrarPopUp();
    }
  }

  public getAllChats(): void {
    this.mensajeriaService.getChats().subscribe({
      next: (data: Chat[]) => {
        let nuevosMensajesCount = 0;
        // Mapa para guardar los mensajes nuevos actuales
        const mensajeNuevoMap = new Map<number, string>();
        this.chats.forEach(chat => {
            if (chat.mensajeNuevo !== undefined) {
                mensajeNuevoMap.set(chat.id, chat.mensajeNuevo);
            }
        });
        this.chats = data.map(chat => {
          const mensajesNoLeidos = chat.mensajes.filter(mensaje => !mensaje.leido && mensaje.userId !== this.usuario.id).length;
          const isNew = mensajesNoLeidos > 0;
          const mensajeGuardado = localStorage.getItem(`mensajeNuevo_${chat.id}`);
          const esBorrador = !!mensajeGuardado;
          return {
            ...chat,
            nuevoMensaje: isNew,
            mensajesNoLeidos: mensajesNoLeidos,
            esBorrador: esBorrador,
            mensajeNuevo: mensajeGuardado || '',
          }});

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

  public startPolling(): void {
    // Limpia el intervalo anterior si existe
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Inicia un nuevo intervalo
    this.intervalId = setInterval(() => {
      if (this.chatActual && this.chatActual.id) {
        if (!this.isDropdownOpen) {
          this.mensajeriaService.getMensajesByChatId(this.chatActual.id).subscribe({
            next: (response) => {
              this.mensajesSeleccionados = response;

              if (!this.mostrarChatsIndividuales) {
                // Detectar nuevos mensajes no leídos
                const nuevosMensajes = response.filter(
                  (mensaje: any) =>
                    !mensaje.leido &&
                    mensaje.userId !== this.usuario.id &&
                    !this.mensajesContabilizados.has(mensaje.id)
                );

                // Agregar los nuevos mensajes al registro y actualizar el contador
                nuevosMensajes.forEach((mensaje: any) => this.mensajesContabilizados.add(mensaje.id));
                this.mensajesIndividualesPendientes += nuevosMensajes.length;
              } else {
                // Si estamos en la vista individual, marcar como leídos y limpiar el registro
                this.mensajesIndividualesPendientes = 0;
                this.mensajesContabilizados.clear();
                this.marcarMensajesComoLeidos();
              }

              // Actualizar los mensajes en el chat actual
              if (this.chatActual) {
                this.chatActual.mensajes = response; // Asegura que chatActual no es undefined
              }
            },
            error: (error) => {
              console.error('Error al obtener mensajes:', error);
            }
          });
        }
      }
    }, 3000); // Intervalo de 3 segundos
  }


  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.chatIntervalId) {
      clearInterval(this.chatIntervalId);
    }
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
      this.conectarUsuario(false);

    }

    if (this.saludoSubscription) {
      this.saludoSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();

    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    if (this.intervaloMensajesGrupalesId) {
      clearInterval(this.intervaloMensajesGrupalesId);
    }

  }

  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.userId) {
      this.webSocketService.reportarUsuarioConectado(this.userId, false);
    }
    const message = '¿Estás seguro de que quieres salir?';
    event.returnValue = message;  // Esto puede no funcionar en todos los navegadores.
     return message;
   }




   public seleccionarChat(chat: Chat | null): void {
    if (!chat || !chat.mensajes) {
      console.error('No se proporcionaron datos válidos para el chat o los mensajes no están disponibles.');
      return;
    }

    // Limpiar las variables de los chats grupales cuando se selecciona un chat individual
    this.chatActualGrupal = null;
    this.mensajesSeleccionadosGrupales = [];

    // Guardar el mensaje actual en el localStorage antes de cambiar de chat
    if (this.chatActual) {
      localStorage.setItem(`mensajeNuevo_${this.chatActual.id}`, this.mensajeNuevo);
    }

    // Cambiar al nuevo chat individual
    this.chatActual = chat;
    this.chatActual.nuevoMensaje = false;
    this.mensajesSeleccionados = chat.mensajes;
    this.mensajeriaService.resetearContadorMensajes();
    this.escucharEscribiendo(this.chatActual.receptorId);
    this.estadoUsuario(this.chatActual.receptorId);

    // Restaurar el mensaje nuevo del chat actual desde localStorage
    const mensajeGuardado = localStorage.getItem(`mensajeNuevo_${this.chatActual.id}`);
    this.mensajeNuevo = mensajeGuardado || '';
    this.esBorrador = !!mensajeGuardado;

    this.cargarMensajes(chat.id).then(() => {
      this.marcarMensajesComoLeidos();
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  public seleccionarChatGrupal(chat: ChatGrupal | null): void {
    if (!chat) {
      console.error('No se proporcionaron datos válidos para el chat grupal.');
      return;
    }

    // Limpiar las variables de los chats individuales cuando se selecciona un chat grupal
    this.chatActual = null;
    this.mensajesSeleccionados = [];

    // Guardar el mensaje actual del chat grupal si fuera necesario
    if (this.chatActualGrupal) {
      localStorage.setItem(`mensajeNuevo_${this.chatActualGrupal.id}`, this.mensajeNuevo);
    }

    // Cambiar al nuevo chat grupal
    this.chatActualGrupal = chat;
    this.mensajesSeleccionadosGrupales = [];

    // Obtener mensajes del chat grupal
    this.mensajeriaService.obtenerMensajesDeChatGrupal(chat.id).subscribe(
      (mensajes: MensajeGrupalDTO[]) => {
        // Asignar los mensajes obtenidos
        this.mensajesSeleccionadosGrupales = mensajes;

        console.log('Mensajes del chat grupal:', this.mensajesSeleccionadosGrupales);

        // Restaurar el mensaje nuevo del chat actual desde localStorage
        const mensajeGuardado = localStorage.getItem(`mensajeNuevo_${this.chatActualGrupal?.id}`);
        this.mensajeNuevo = mensajeGuardado || '';
        this.esBorrador = !!mensajeGuardado;

        // Marcar los mensajes como leídos y hacer scroll
        setTimeout(() => this.scrollToBottom(), 0);
      },
      (error) => {
        console.error('Error al obtener los mensajes del chat grupal:', error);
      }
    );
    this.escucharEscribiendoGrupal(chat.id);
    this.intervaloMensajesGrupales();
  }

  public handleInput(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;

    if (this.esBorrador) {
        this.esBorrador = false;
    } else {
        this.mensajeNuevo = value;
    }
  }


  public conectarUsuario(estado:boolean): void {
    this.loginService.obtenerUsuario().subscribe({
      next: (usuario: Usuario) => {
        this.webSocketService.reportarUsuarioConectado(usuario.id, estado);
        this.userId = usuario.id; // Guardar userId para uso posterior
      },
      error: error => {
        console.error('Error al obtener el usuario para la conexión:', error);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  public enviarMensajeGeneral(): void {
    if (this.chatActualGrupal) {
      // Enviar mensaje a un chat grupal
      this.enviarMensajeGrupal();
    } else if (this.chatActual) {
      // Enviar mensaje a un chat individual
      this.enviarMensaje();
    } else {
      console.error('No se ha seleccionado un chat válido.');
    }
  }





  public enviarMensaje(): void {
    if (!this.mensajeNuevo.trim() && !this.urlImagen) {
      return; // No hacer nada si ambos, el mensaje y la imagen, están vacíos
    }

    let mensajeAEnviar = this.mensajeNuevo;
    if (mensajeAEnviar.startsWith("borrador : ")) {
        mensajeAEnviar = mensajeAEnviar.replace("borrador : ", "");
    }

    if (this.chatActual && this.chatActual.receptorId) {
      const mensajeEnvio: MensajeEnvio = {
        id: this.mensajeEnEdicion?.id,
        receptorId: this.chatActual.receptorId,
        contenido: mensajeAEnviar,
      };
      if (this.urlImagen) {
        // Extraer solo la parte en base64 de la URL de la imagen
        const base64Content = (this.urlImagen as string).split(',')[1];
        mensajeEnvio.imagenMensajeBase64 = base64Content;
      }

      if (this.urlArchivo) {
        // Extraer solo la parte en base64 de la URL del archivo
        const base64Content = (this.urlArchivo as string).split(',')[1];
        mensajeEnvio.archivoMensajeBase64 = base64Content;
      }

      // Enviar el mensaje
      this.mensajeriaService.enviarMensaje(mensajeEnvio).subscribe({
        next: (respuesta) => {
          // Resetear el campo de mensaje nuevo instantáneamente
          this.mensajeNuevo = '';
          if (this.chatActual) {
            this.mensajeNuevo = '';
            localStorage.removeItem(`mensajeNuevo_${this.chatActual.id}`);
        }
          if (this.emojiPicker) {
            this.emojiPicker.ocultarEmojis();
          }
          this.urlImagen = null;
          this.fileInputRef.nativeElement.value = ''; // Resetear el input de archivo

          // Actualizar o añadir el chat en la lista de chats
          const index = this.chats.findIndex(c => c.receptorId === this.chatActual?.receptorId);
          if (index !== -1) {
            this.chats[index] = {
              ...this.chats[index],
              mensajes: [...this.chats[index].mensajes, respuesta]
            };
            const [chatToMove] = this.chats.splice(index, 1);
            this.chats.unshift(chatToMove);

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

          // Notificar al servidor que el usuario ha dejado de escribir después de un pequeño retraso
          setTimeout(() => {
            this.webSocketService.sendMessage('/app/escribiendo', {
              chatId: this.chatActual?.userId,
              escribiendo: false
            });
          }, 1000);

          clearTimeout(this.escribiendoTimeout);
        },
        error: (error) => {
          console.error('Error al enviar el mensaje:', error);
        }
      });

      this.mensajeEnEdicion = null;
      this.restoreOriginalState();
    } else {
      console.error('No se ha seleccionado un chat válido o falta el receptorId');
    }
  }

  public intervaloMensajesGrupales(): void {
    if (!this.chatActualGrupal || !this.chatActualGrupal.id) {
      console.error('No se ha seleccionado un chat grupal válido.');
      return;
    }

    // Limpiar el intervalo anterior si ya existe
    if (this.intervaloMensajesGrupalesId) {
      clearInterval(this.intervaloMensajesGrupalesId);
    }

    // Iniciar un nuevo intervalo de 3 segundos
    this.intervaloMensajesGrupalesId = setInterval(() => {
      if(this.chatActualGrupal)
      this.mensajeriaService.obtenerMensajesDeChatGrupal(this.chatActualGrupal.id).subscribe(
        (mensajes: MensajeGrupalDTO[]) => {
          // Asignar los mensajes obtenidos
          this.mensajesSeleccionadosGrupales = mensajes;

          // Marcar los mensajes como leídos y hacer scroll
          setTimeout(() => this.scrollToBottom(), 0);
        },
        (error) => {
          console.error('Error al obtener los mensajes del chat grupal:', error);
        }
      );
    }, 3000);  // Intervalo de 3 segundos
  }


  public enviarMensajeGrupal(): void {
    if (!this.mensajeNuevo.trim() && !this.urlImagen) {
      return; // No hacer nada si ambos, el mensaje y la imagen, están vacíos
    }

    // Eliminar el prefijo "Borrador : " del mensaje nuevo
    if (this.mensajeNuevo.startsWith("borrador : ")) {
      this.mensajeNuevo = this.mensajeNuevo.replace("borrador : ", "");
    }

    const mensajeAEnviar = this.mensajeNuevo;

    if (this.chatActualGrupal && this.chatActualGrupal.id) {
      const mensajeEnvio: MensajeEnvioGrupal = {
        contenido: mensajeAEnviar,
        chatGrupalId: this.chatActualGrupal.id,
        imagenMensajeBase64: this.urlImagen ? (this.urlImagen as string).split(',')[1] : undefined,
        archivoMensajeBase64: this.urlArchivo ? (this.urlArchivo as string).split(',')[1] : undefined
      };

      // Enviar el mensaje a través del servicio
      this.mensajeriaService.enviarMensajeGrupal(mensajeEnvio).subscribe({
        next: (respuesta) => {
          // Crear un nuevo objeto de tipo MensajeGrupalDTO
          const nuevoMensaje: MensajeGrupalDTO = {
            id: respuesta.id,
            contenido: mensajeAEnviar,
            nombreUsuario: this.usuario.nombreCompleto,
            fechaCreacion: respuesta.fechaCreacion,
            imagenPerfil: this.usuario.imagenPerfilBase64 ?? undefined,
            userId: this.usuario.id ?? 0
          };

          // Agregar el nuevo mensaje a la lista de mensajes grupales seleccionados
          this.mensajesSeleccionadosGrupales.push(nuevoMensaje);

          // Limpiar los campos después del envío
          this.mensajeNuevo = ''; // Aseguramos que el campo de texto quede vacío
          this.urlImagen = null;
          this.urlArchivo = null;

          // Eliminar el borrador asociado al chat grupal actual
          localStorage.removeItem(`mensajeNuevo_${this.chatActualGrupal?.id}`);

          // Actualizar el último mensaje del chat grupal
          const index = this.chatsGrupales.findIndex(chat => chat.id === this.chatActualGrupal?.id);
          if (index !== -1) {
            this.chatsGrupales[index] = {
              ...this.chatsGrupales[index],
              ultimoMensaje: {
                contenido: mensajeAEnviar,
                fechaCreacion: respuesta.fechaCreacion,
                userId: this.usuario.id ?? undefined,
                nombreRemitente: 'Tú',
                imagenMensaje: '',
                reaccion: '',
                edit: false
              }
            };

            // Mover el chat grupal actual al principio de la lista
            const [chatToMove] = this.chatsGrupales.splice(index, 1);
            this.chatsGrupales.unshift(chatToMove);

            // Asegurar que el chat grupal actual sigue seleccionado
            this.chatActualGrupal = chatToMove;
          }

          this.restoreOriginalState();
          // Hacer scroll hasta el final de los mensajes
          setTimeout(() => this.scrollToBottom(), 0);
        },
        error: (error) => {
          console.error('Error al enviar el mensaje grupal:', error);
        }
      });
    } else {
      console.error('No se ha seleccionado un chat grupal válido.');
    }
  }





  private async cargarMensajes(chatId: number): Promise<void> {
    try {
      const response = await this.mensajeriaService.getMensajesByChatId(chatId).toPromise();
      this.mensajesSeleccionados = response;

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
      this.nombreArchivo = archivo.name;
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = reader.result as string;
        const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64Content);
        if (archivo.type.startsWith('image/')) {
          this.urlImagen = base64Content;
          this.nombreImagen = archivo.name;
          this.urlArchivo = null; // Limpiar el campo de archivo si es una imagen
          this.isPdf = false;
        } else if (archivo.type === 'application/pdf') {
          this.urlArchivo = sanitizedUrl;
          this.urlImagen = null; // Limpiar el campo de imagen si es un archivo
          this.isPdf = true;
        } else {
          this.urlArchivo = base64Content;
          this.urlImagen = null; // Limpiar el campo de imagen si es un archivo
          this.isPdf = false;
        }
      };
      reader.readAsDataURL(archivo);
    }
  }



  quitarImagen(): void {
    this.urlImagen = null;
    this.nombreImagen = '';
    this.urlArchivo = null;
    this.nombreArchivo = '';
    this.fileInputRef.nativeElement.value = '';
    this.isPdf = false;
  }

  notificarEscribiendoGeneral(): void {
    if (this.chatActual && this.chatActual.receptorId) {
      // Si es un chat individual, llama a la función correspondiente
      this.notificarEscribiendo();
    } else if (this.chatActualGrupal && this.chatActualGrupal.id) {
      // Si es un chat grupal, llama a la función correspondiente
      this.notificarEscribiendoGrupal();
    }
  }




  notificarEscribiendo(): void {
    if (this.chatActual && this.chatActual.receptorId) {
      this.webSocketService.sendMessage('/app/escribiendo', {
        chatId: this.chatActual.userId,
        escribiendo: true
      });

      clearTimeout(this.escribiendoTimeout);
      this.escribiendoTimeout = setTimeout(() => {
        this.webSocketService.sendMessage('/app/escribiendo', {
          chatId: this.chatActual?.userId,
          escribiendo: false
        });
      }, 500);
    }
  }

  private estadoUsuario(userId: number | undefined){

    const topic = "/topic/user-status";

    this.statusSubscription = this.webSocketService.subscribeToTopicStatus("/topic/user-status", (status: UserStatus) => {
      this.usuarioConectado = status.connected;
    });

    this.webSocketService.subscribeToTopic(topic, (status: UserStatus) => {
      this.usuarioConectado = status.connected;
    });

    const endpoint = "/app/check-user-status"; // Envía la solicitud después de establecer la suscripción
    this.webSocketService.sendMessage(endpoint, { userId: userId });
  }






  private escucharEscribiendo(userId: number | undefined): void {
    if (!userId) {
      console.error('User ID is undefined.');
      return;
    }

    const topic = `/topic/escribiendo.${userId}`;

    if (this.currentTopic) {
      this.webSocketService.unsubscribeFromTopic(this.currentTopic);
    }

    this.currentTopic = topic;
    this.webSocketService.subscribeToTopic(topic, (escribiendo: boolean) => {
      this.isEscribiendo = escribiendo;
    });
  }


  prepararEdicionMensaje(mensaje: Mensaje): void {
    // Aquí asumimos que 'mensaje' tiene todas las propiedades necesarias
    this.mensajeEnEdicion = {
      id: mensaje.id,
      receptorId: this.chatActual?.receptorId || 0, // Asegúrate de manejar el receptorId correctamente
      contenido: mensaje.contenido,
      imagenMensajeBase64: mensaje.imagenMensaje || '' // Ajusta según corresponda
      // Añade otras propiedades según sea necesario
    };
    this.mensajeNuevo = mensaje.contenido; // Colocar el texto del mensaje en el input

    // Ajustar el tamaño del textarea
    setTimeout(() => {
      const textarea = document.querySelector('.mensajeInput') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, 0);
  }


  actualizarReaccion(mensajeId: number, reaccion: string): void {
    this.mensajeriaService.actualizarReaccion(mensajeId, reaccion).subscribe(
      (response: string) => {
        // Aquí puedes manejar la reacción actualizada como necesites
        this.cerrarPopUp();
      },
      (error:any) => {
        console.error('Error al actualizar la reacción:', error);
      }
    );
  }
  mostrarPopUpReaccion(mensajeId?: number, event?: MouseEvent): void {
    if (mensajeId !== undefined) {
      this.mensajeSeleccionado = mensajeId;
    }
    if (event) {
      event.stopPropagation(); // Detener la propagación del evento para que no llegue al HostListener del documento
    }
  }

  cerrarPopUp(): void {
    this.mensajeSeleccionado = null;
  }

  autoWrap(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const maxWidth = textarea.clientWidth * 0.9; // 90% del ancho
    const lines = textarea.value.split('\n');
    const wrappedLines = lines.map(line => this.wrapLine(line, maxWidth, textarea));
    textarea.value = wrappedLines.join('\n');
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  wrapLine(line: string, maxWidth: number, textarea: HTMLTextAreaElement): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) context.font = window.getComputedStyle(textarea).font;
    let wrappedLine = '';
    let currentLine = '';

    for (const char of line) {
      const testLine = currentLine + char;
      const metrics = context?.measureText(testLine);
      if (metrics && metrics.width > maxWidth) {
        wrappedLine += currentLine + '\n';
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    wrappedLine += currentLine;
    return wrappedLine;
  }

  restoreOriginalState(): void {
    const textarea = document.querySelector('.mensajeInput') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = '45px'; // Altura original deseada
      textarea.style.width = '100%';  // Ancho original deseado
      this.mensajeNuevo = '';
    }
  }

  public handleVisibilityChange(): void {
    if (document.hidden) {
      // Usuario ha cambiado de pestaña/ventana
      this.ausenciaTimeout = setTimeout(() => {
        this.usuarioAusente = true;
      }, this.tiempoAusencia);
    } else {
      // Usuario ha vuelto a la pestaña/ventana
      if (this.ausenciaTimeout) {
        clearTimeout(this.ausenciaTimeout);
      }
      this.usuarioAusente = false;
    }
  }

  notificarEscribiendoGrupal(): void {
    if (this.chatActualGrupal && this.chatActualGrupal.id) {
      const estadoEscribiendo = {
        chatId: this.chatActualGrupal.id,
        escribiendo: true,
        nombreRemitente: this.usuario.datosPersonales.nombre + ' ' + this.usuario.datosPersonales.apellidos  // Nombre del usuario logueado
      };

      // Log para probar que se está llamando correctamente
      console.log('Notificando escribiendo en chat grupal:', estadoEscribiendo);

      this.webSocketService.sendMessage('/app/escribiendo-grupal', estadoEscribiendo);

      clearTimeout(this.escribiendoTimeout);
      this.escribiendoTimeout = setTimeout(() => {
        const estadoEscribiendoFinal = {
          chatId: this.chatActualGrupal?.id,
          escribiendo: false,
          nombreRemitente: this.usuario.datosPersonales.nombre
        };

        // Log para probar que el mensaje de "dejó de escribir" funciona
        console.log('Notificando dejó de escribir en chat grupal:', estadoEscribiendoFinal);

        this.webSocketService.sendMessage('/app/escribiendo-grupal', estadoEscribiendoFinal);
      }, 500);
    }
  }

  public esMismoUsuarioEscribiendo(): boolean {
    return this.nombreEscribiendoGrupal ===
      `${this.usuario.datosPersonales.nombre} ${this.usuario.datosPersonales.apellidos} está escribiendo...`;
  }


  private escucharEscribiendoGrupal(chatId: number): void {
    if (!chatId) {
      console.error('Chat ID is undefined.');
      return;
    }

    const topic = `/topic/escribiendo-grupal.${chatId}`;

    if (this.currentGroupTopic) {
      this.webSocketService.unsubscribeFromTopic(this.currentGroupTopic);
      console.log('Desuscribiéndose del tema anterior:', this.currentGroupTopic);
    }

    this.currentGroupTopic = topic;
    console.log(`[Usuario: ${this.usuario.nombreCompleto}] Suscribiéndose al tema: ${topic}`);

    this.webSocketService.subscribeToTopic(topic, (estado: any) => {
      console.log(`[Usuario: ${this.usuario.nombreCompleto}] Mensaje recibido del WebSocket:`, estado);

      // Comparar si el remitente es el usuario actual
      if (estado.nombreRemitente !== this.usuario.datosPersonales.nombre + ' ' + this.usuario.datosPersonales.apellidos) {
        this.nombreEscribiendoGrupal = estado.escribiendo
          ? `${estado.nombreRemitente} está escribiendo`
          : '';
      } else {
        // Si el remitente es el usuario actual, no mostrar nada
        this.nombreEscribiendoGrupal = '';
      }
    });
  }




}


