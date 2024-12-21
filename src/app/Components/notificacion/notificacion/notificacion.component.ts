import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Notificacion } from 'src/app/Interface/Notificacion';
import { NotificacionService } from 'src/app/Service/notificacion/notificacion.service';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.css']
})
export class NotificacionComponent implements OnInit {
  public notificaciones:Notificacion[] = []
  constructor(private notificacionService:NotificacionService) { }

  ngOnInit(): void {
    this.getNotificaciones();
  }


  public getNotificaciones():void{
    this.notificacionService.getNotificaciones().subscribe((data:any) =>{
      this.notificaciones = data
      console.log(this.notificaciones)
    })
  }

  public marcarComoLeida(notificacionId: number): void {
    this.notificacionService.marcarNotificacionComoLeida(notificacionId).subscribe(success => {
      if (success) {
        this.getNotificaciones();
      }
    });
  }

  public marcarTodasComoLeidas(): void {
    // Filtrar las notificaciones no leídas
    const notificacionesNoLeidas = this.notificaciones.filter(notificacion => !notificacion.leido);

    // Iterar sobre las notificaciones no leídas y marcarlas como leídas
    notificacionesNoLeidas.forEach(notificacion => {
      this.marcarComoLeida(notificacion.id);
    });
  }

}
