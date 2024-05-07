import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { API_ENDPOINT} from 'src/app/Utils/Constants';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor(private httpClient:HttpClient) { }

  public saveOrUpdate(data: Usuario): Observable<any> {
    return this.httpClient.post<any>(API_ENDPOINT + "usuario/saveOrUpdate", data);
  }
}
