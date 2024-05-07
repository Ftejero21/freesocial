import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExperienciaLaboral } from 'src/app/Interface/ExperienciaLaboral';
import { Proyecto } from 'src/app/Interface/Proyecto';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  constructor(private httpClient:HttpClient,private Utils:utils) { }

  public saveOrUpdate(data: Proyecto): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "proyecto/saveOrUpdate", data, { headers: headers });
  }

  public getProyecto(id?: number): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    const url = API_ENDPOINT + "proyecto/getProyecto" + (id ? `/${id}` : '');

    return this.httpClient.get<any>(url, { headers: headers });
  }
}
