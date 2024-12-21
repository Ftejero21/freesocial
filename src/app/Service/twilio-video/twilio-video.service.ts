import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TwilioVideoService {

  constructor(private http: HttpClient, private utils: utils) { }


  public getTwilioToken(identity: string | undefined, roomName: string): Observable<string> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    const url = `${API_ENDPOINT}twilio/token?identity=${identity}&roomName=${roomName}`;

    // Cambia el tipo de respuesta a 'text' para evitar que Angular intente parsear la respuesta como JSON
    return this.http.get(url, { headers: headers, responseType: 'text' });
  }

}
