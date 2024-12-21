import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExperienciaLaboral } from 'src/app/Interface/ExperienciaLaboral';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ExperienciaService {

  constructor(private httpClient:HttpClient,private Utils:utils) { }


  public saveOrUpdate(data: ExperienciaLaboral): Observable<ExperienciaLaboral> {

    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<ExperienciaLaboral>(API_ENDPOINT + "experiencia/saveOrUpdate", data, { headers: headers });
  }

  public getExperiencia(id?: number): Observable<any> {
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    const url = API_ENDPOINT + "experiencia/getExperiencia" + (id ? `/${id}` : '');

    return this.httpClient.get<any>(url, { headers: headers });

  }


  public deleteExperiencia(id:number): Observable<any> {
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.delete<any>(API_ENDPOINT + "experiencia/deleteExperiencia/"+id  ,{ headers: headers });
  }

  public totalAñosExperiencia(): Observable<any> { // Cambia el tipo de retorno a Observable<string>
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get(API_ENDPOINT + "experiencia/tiempoTotalTrabajado", { headers: headers, responseType: 'text' });
  }

}
