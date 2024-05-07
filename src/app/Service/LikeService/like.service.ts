import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  constructor(private httpClient:HttpClient, private utils: utils) { }


  darLike(publicacionId: number): Observable<any> {
    const storedToken = this.utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    return this.httpClient.post(`${API_ENDPOINT}like/darLike/${publicacionId}`, {}, {
        headers: headers,
        responseType: 'text'  // Ajusta la expectativa de tipo de respuesta a texto plano
    });
}


}
