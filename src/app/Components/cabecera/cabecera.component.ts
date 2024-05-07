// import { Component, OnInit } from '@angular/core';
// import { NavigationEnd, Router, RouterEvent } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { Usuario } from 'src/app/Interface/UsuarioRegistro';
// import { LoginService } from 'src/app/Service/Login/login.service';
// import { MensajeriaService } from 'src/app/Service/mensajeria/mensajeria.service';
// import { filter } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval, throwError } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { catchError, filter, retry, switchMap } from 'rxjs/operators';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { LoginService } from 'src/app/Service/Login/login.service';
import { MensajeriaService } from 'src/app/Service/mensajeria/mensajeria.service';
import { validateStoredToken } from 'src/app/Utils/token-utils';
import { ErrorService } from 'src/app/Service/Error/error.service';
import { Chat } from 'src/app/Interface/Chat';



@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent implements OnInit {
  public nombreBusqueda = ''
  public resultadosBusqueda: Usuario[] = [];
  public usuario!:Usuario | null;
  public imagenPerfil!:string | null | undefined
  mensajeNewCount: number = 0;
  private chatsSubscription!: Subscription;
  private subs: Subscription = new Subscription();
  private routerSubscription!: Subscription;
  isInMensajeria: boolean = false;
  rutaActual!: string;
  rutasExcluidas: string[] = ['inicio', 'mensajeria'];
  constructor(private errorService: ErrorService ,private loginService:LoginService,private router: Router,private mensajeriaService: MensajeriaService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Obtener la ruta completa como una cadena
      let route = this.activatedRoute;
      while (route.firstChild) route = route.firstChild;
      this.rutaActual = route.snapshot.url.map(segment => segment.path).join('/');

      // Verificar si la ruta actual no está en el arreglo de rutas excluidas
      if (!this.rutasExcluidas.includes(this.rutaActual)) {
        this.obtenerUsuario();
        this.subs.add(this.mensajeriaService.mensajeNewCount$.subscribe(count => {
          this.mensajeNewCount = count;
        }));

        this.subs.add(
          this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
          ).subscribe((event: NavigationEnd) => {
            this.isInMensajeria = event.urlAfterRedirects.includes('/mensajeria');
          })
        );
      }
    });


  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.routerSubscription.unsubscribe();
  }



  public onLogout() {
      localStorage.removeItem('authToken');
      this.usuario = null
      this.router.navigate(['/inicio']).then(success => {
        if (!success) {
          console.log('Navegación a inicio falló');
        }
      });
  }

  public irAPerfil(id: number | null) {
    if (id === null) {
      this.router.navigate(['/perfil/null']);
    } else {
      this.router.navigate(['/perfil', id]);
    }
  }




  public shouldShowLogoutIcon(): boolean {
    return this.router.url !== '/inicio'; // Reemplaza '/inicio' con la ruta de tu página de inicio
  }

  buscarUsuario(nombre: string): void {
    // tenemos que cambiar esto para que no se ejecute cada vez que escribamos porque entonces aumentaremos el contador 20 veces
    if (nombre.length >= 1) { // Ajusta esto según tus necesidades
      this.loginService.buscarUsuarios(nombre).subscribe({
        next: (data) => {
          this.resultadosBusqueda = data;

        },
        error: (error) => console.error(error)
      });
    } else {
      this.resultadosBusqueda = []; // Limpia los resultados si la consulta es demasiado corta
    }
  }
  trackByFn(index:any, item:any) {
    return index; // o un identificador único de tus objetos si lo tienes
  }

  public obtenerUsuario() {
    console.log("solo se ejecuta en cuando no estamos en inicio")
     this.loginService.obtenerUsuario().subscribe(
        (usuario: Usuario) => {
          this.imagenPerfil = usuario.imagenPerfil;
          this.usuario = usuario;

        },
        error => {
          console.error('Error al obtener los datos del usuario', error);
        }
      );
  }

  // private monitorMensajesNuevos(): void {
  //   this.chatsSubscription = interval(3000).pipe(
  //     switchMap(() => this.mensajeriaService.getChats())
  //   ).subscribe(chats => {
  //     let nuevosMensajesCount = 0;
  //     chats.forEach((chat:Chat) => {
  //       const lastMessage = chat.mensajes[chat.mensajes.length - 1];
  //       if (lastMessage && !lastMessage.leido && lastMessage.userId !== this.usuario?.id) {
  //         nuevosMensajesCount++;
  //       }
  //     });
  //     this.mensajeNewCount = nuevosMensajesCount;
  //   });
  // }

}
