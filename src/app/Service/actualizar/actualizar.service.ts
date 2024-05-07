import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ActualizarService {

  constructor(private httpClient:HttpClient,private Utils:utils) { }

  public saveOrUpdate(data: Usuario): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "usuario/saveOrUpdate", data, { headers: headers });
  }
}
