import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  constructor(private httpClient:HttpClient,private Utils:utils) { }


  public getNotificaciones(): Observable<any> {
    const storedToken = this.Utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    const url = API_ENDPOINT + "notificacion/getNotificaciones";

    return this.httpClient.get<any>(url, { headers: headers });

  }

  public marcarNotificacionComoLeida(notificacionId: number): Observable<boolean> {
    const storedToken = this.Utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    const url = API_ENDPOINT + `notificacion/marcar-leido/${notificacionId}`;

    return this.httpClient.patch<boolean>(url, null, { headers: headers });
  }
}
