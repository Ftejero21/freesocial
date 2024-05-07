import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Educacion } from 'src/app/Interface/Educacion';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class EducacionService {

  constructor(private httpClient: HttpClient,private Utils:utils) { }

  public saveEducacion(data: Educacion): Observable<any> {
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "educacion/saveOrUpdate", data, { headers: headers });
  }

  public getEducacion(id?: number): Observable<any> {
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    const url = API_ENDPOINT + "educacion/getEducacion" + (id ? `/${id}` : '');

    return this.httpClient.get<any>(url, { headers: headers });
  }



  public deleteEducacion(id:number): Observable<any> {
    const storedToken = this.Utils.getToken();


    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.delete<any>(API_ENDPOINT + "educacion/deleteEducacion/"+id  ,{ headers: headers });
  }


}
