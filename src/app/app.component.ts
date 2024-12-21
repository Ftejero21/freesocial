import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstadoUsuarioServiceService } from './Service/EstadoUsuarioService/estado-usuario-service.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';  // Importa el operador filter
import { Subscription } from 'rxjs';
import { WebSocketService } from './Service/WebSocket/web-socket.service';
import { LoginService } from './Service/Login/login.service';
import { parseJSON } from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'FreeSocial';
  private routerSubscription!: Subscription;
  usuarioId!: number;

  constructor(private loginService: LoginService,private estadoUsuarioService: EstadoUsuarioServiceService, private router: Router,private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Filtrar solo eventos de navegación finalizados
    ).subscribe((event) => {
      const navigationEndEvent = event as NavigationEnd; // Asegura que el evento es de tipo NavigationEnd
      if (!navigationEndEvent.urlAfterRedirects.includes('/inicio')) {
        console.log("no se encuentra en la url de inicio")
        this.estadoUsuarioService.iniciarMonitoreoEstado();
      } else {
        this.estadoUsuarioService.detenerMonitoreoEstado();
      }
    });


  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.estadoUsuarioService.detenerMonitoreoEstado(); // Limpia el intervalo al destruir el componente
  }
}
