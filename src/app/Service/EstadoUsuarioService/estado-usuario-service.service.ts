import { Injectable } from '@angular/core';
import { LoginService } from '../Login/login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EstadoUsuarioServiceService {

  private intervalId: any;
  private monitorInterval: any;
  private monitoringActive = false;

  constructor(private loginService: LoginService, private router: Router) { }

  iniciarMonitoreoEstado(): void {
    this.intervalId = setInterval(() => {
      this.loginService.obtenerEstadoUsuarioActual().subscribe({
        next: (estado: string) => {
          if (estado === 'Bloqueado') {
            this.handleUsuarioBloqueado();
          }
        },
        error: (error) => {
          console.error('Error al obtener el estado del usuario:', error);
        }
      });
    }, 1000); // Verifica el estado cada 5 segundos (ajusta según tus necesidades)
  }

  detenerMonitoreoEstado(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private handleUsuarioBloqueado(): void {
    this.router.navigate(['/inicio']).then(success => {
      if (!success) {
        console.log('Navegación a inicio falló');
      }
    });
  }
}
