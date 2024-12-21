import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, retry, throwError } from 'rxjs';
import { MensajeEnvio } from 'src/app/Interface/MensajeEnvio';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';
import { LoginService } from '../Login/login.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Mensaje } from 'src/app/Interface/Mensaje';
import { ChatGrupal } from 'src/app/Interface/ChatGrupal';
import { MensajeEnvioGrupal } from 'src/app/Interface/MensajeEnvioGrupal';
import { MensajeGrupalDTO } from 'src/app/Interface/MensajeGrupalDTO';
import { ChatGrupalCreacion } from 'src/app/Interface/ChatGrupalCreacion';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaService {
  private _mensajeNewCount = new BehaviorSubject<number>(0);
  public usuario!:Usuario
  public usuarioId!: number;
  rutaActual: string = "";
  rutasExcluidas: string[] = ['inicio', 'mensajeria'];
  private mensajesInterval: any;
  constructor(private httpClient:HttpClient,private utils:utils,private activatedRoute:ActivatedRoute,private loginService:LoginService,private router:Router) {
    this.monitorRouterEvents();
  }

  ngOnDestroy() {
    if (this.mensajesInterval) {
        clearInterval(this.mensajesInterval);
    }
  }

  private monitorRouterEvents(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
      this.executeActionsBasedOnRoute();
    });
  }

  private updateCurrentRoute(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
        route = route.firstChild;
    }
    this.rutaActual = route.snapshot.url.map(segment => segment.path).join('/');
    console.log("Ruta actual obtenida:", this.rutaActual);  // Esto te mostrará qué ruta está siendo procesada
  }

  private executeActionsBasedOnRoute(): void {
    if (!this.rutasExcluidas.includes(this.rutaActual)) {
        console.log("Executing actions for route:", this.rutaActual);
        this.obtenerUsuario();
        this.monitorMensajesNuevos();
        this.getChats();
    } else {
        console.log("Route excluded from actions:", this.rutaActual);
        if (this.mensajesInterval) {
            clearInterval(this.mensajesInterval);
            this.mensajesInterval = null;
            console.log("Interval for monitoring new messages has been stopped");
        }
    }
  }


  public getChats(): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<any>(API_ENDPOINT + "mensajeria/getChats", { headers: headers });
  }

  public crearChatGrupal(chatGrupal: ChatGrupalCreacion): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(
      API_ENDPOINT + "mensajeria/crear-chat-grupal",
      chatGrupal,
      { headers: headers }
    );
  }

  public obtenerChatsGrupales(): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<any>(API_ENDPOINT + "mensajeria/chats-grupales", { headers: headers });
  }

  public obtenerMensajesDeChatGrupal(chatGrupalId: number | null): Observable<MensajeGrupalDTO[]> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<MensajeGrupalDTO[]>(`${API_ENDPOINT}mensajeria/mensajes-grupales/${chatGrupalId}`, { headers: headers });
  }

  public enviarMensajeGrupal(mensajeEnvio: MensajeEnvioGrupal): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "mensajeria/enviar-mensaje-grupal", mensajeEnvio, { headers: headers });
  }

  public enviarMensaje(mensaje:MensajeEnvio):Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "mensajeria/enviar", mensaje, { headers: headers });
  }

  public MensajeLeido(id?: number):Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.patch<any>(API_ENDPOINT + "mensajeria/marcarLeido/"+ id, { headers: headers });
  }

  public editarMensaje(mensajeDTO: Mensaje): Observable<Mensaje> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.put<Mensaje>(API_ENDPOINT + 'mensajeria/editar', mensajeDTO, { headers: headers });
  }
  public actualizarReaccion(id: number, reaccion: string): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`)
                                      .set('Content-Type', 'text/plain')
                                      .set('Accept', 'text/plain'); // Asegurarse de aceptar texto plano
    return this.httpClient.put(`${API_ENDPOINT}mensajeria/${id}/reaccion`, reaccion, { headers, responseType: 'text' });
  }

  enviarEstadoEscribiendo(chatId: string, escribiendo: boolean) {
    const url = API_ENDPOINT + "mensajeria/escribiendo";
    const storedToken = this.utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post(url, { chatId, escribiendo }, { headers: headers });
  }

  public deleteMensaje(id:number):Observable<String>{
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.delete<String>(API_ENDPOINT + "mensajeria/deleteMensaje/"+ id, { headers: headers });
  }

  public getMensajesByChatId(id?: number): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);


    return this.httpClient.get<any>(API_ENDPOINT + "mensajeria/chat/"+id, { headers: headers });
  }

  get mensajeNewCount$() {
    return this._mensajeNewCount.asObservable();
  }

  public obtenerUsuario() {
    this.loginService.obtenerUsuario().subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
      },
      error => {
        console.error('Error al obtener los datos del usuario', error);
      }
    );
  }

  private monitorMensajesNuevos(): void {
    if (this.mensajesInterval) {
      clearInterval(this.mensajesInterval);
      this.mensajesInterval = null;
    }

    this.mensajesInterval = setInterval(() => {
      this.getChats().subscribe(chats => {
        let nuevosMensajesCount = 0;
        chats.forEach((chat:any) => {
          const lastMessage = chat.mensajes[chat.mensajes.length - 1];
          if (lastMessage && !lastMessage.leido && lastMessage.userId !== this.usuario.id) {
            nuevosMensajesCount++;
          }
        });
        if (nuevosMensajesCount > 0) {
          this._mensajeNewCount.next(nuevosMensajesCount);
        } else {
          this._mensajeNewCount.next(0); // Resetear si no hay nuevos mensajes
        }
      });
    }, 1000); // Ajusta el intervalo según sea necesario
  }

  incrementarContadorMensajes(nuevos: number): void {
    let actual = this._mensajeNewCount.value;
    this._mensajeNewCount.next(actual + nuevos);
  }

  resetearContadorMensajes(): void {
    this._mensajeNewCount.next(0);
  }
}
