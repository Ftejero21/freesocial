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
import { NotificacionService } from 'src/app/Service/notificacion/notificacion.service';
import { Notificacion } from 'src/app/Interface/Notificacion';



@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent implements OnInit {
  public nombreBusqueda = ''
  public resultadosBusqueda: Usuario[] = [];
  public usuario!:Usuario | null;
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidasCount = 0;
  public imagenPerfil!:string | null | undefined
  mensajeNewCount: number = 0;
  private chatsSubscription!: Subscription;
  private subs: Subscription = new Subscription();
  private routerSubscription!: Subscription;
  isInMensajeria: boolean = false;
  rutaActual!: string;
  public rolId!:number;
  private previousCount: number = 0;
  private previousNotificacionesCount: number = 0;
  private audio = new Audio('assets/sonido.mp3'); // Ruta al sonido en los assets
  rutasExcluidas: string[] = ['inicio', 'mensajeria' , ''];
  private originalTitle: string = document.title;
  constructor(private errorService: ErrorService ,private loginService:LoginService,private router: Router,private mensajeriaService: MensajeriaService, private activatedRoute: ActivatedRoute,private notificacionService: NotificacionService) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Obtener la ruta completa como una cadena
      let route = this.activatedRoute;
      while (route.firstChild) route = route.firstChild;
      this.rutaActual = route.snapshot.url.map(segment => segment.path).join('/');

      // Verificar si la ruta actual no está en el arreglo de rutas excluidas
      if (!this.rutasExcluidas.includes(this.rutaActual) || this.rutaActual == '') {
        this.obtenerUsuario();
        this.subs.add(this.mensajeriaService.mensajeNewCount$.subscribe(count => {
          if (count > this.previousCount) {
            this.playSound();
          }
          this.updateTitle(count, this.notificacionesNoLeidasCount);
          this.previousCount = count;
          this.mensajeNewCount = count;
        }));
        this.getNotificaciones();
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


  private playSound(): void {
    this.audio.play().catch(error => {
      console.error('Error al reproducir el sonido:', error);
    });
  }

  private updateTitle(mensajeCount: number, notificacionCount: number): void {
    const totalCount = mensajeCount + notificacionCount;
    if (totalCount > 0) {
      document.title = `(${totalCount}) ${this.originalTitle}`;
    } else {
      this.resetTitle();
    }
  }

  private resetTitle(): void {
    document.title = this.originalTitle;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.resetTitle()
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
          this.rolId = this.usuario.roles[0].id;
        },
        error => {
          console.error('Error al obtener los datos del usuario', error);
        }
      );
  }

  public getNotificaciones(): void {
    setInterval(() => {
      this.notificacionService.getNotificaciones().subscribe(data => {
        this.notificaciones = data;
        const newNotificacionesNoLeidasCount = this.notificaciones.filter(n => !n.leido).length;

        if (newNotificacionesNoLeidasCount > this.previousNotificacionesCount) {
          this.playSound();
        }

        this.updateTitle(this.mensajeNewCount, newNotificacionesNoLeidasCount);
        this.previousNotificacionesCount = newNotificacionesNoLeidasCount;
        this.notificacionesNoLeidasCount = newNotificacionesNoLeidasCount;
      });
    }, 2000);
  }

}
