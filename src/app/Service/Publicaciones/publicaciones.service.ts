import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comentario } from 'src/app/Interface/Comentario';
import { Filtro } from 'src/app/Interface/Filtro';
import { Proyecto } from 'src/app/Interface/Proyecto';
import { Publicacion } from 'src/app/Interface/Publicacion';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  constructor(private httpClient:HttpClient,private Utils:utils) { }

  public saveOrUpdate(data: Publicacion): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "publicacion/saveOrUpdate", data, { headers: headers });
  }

  public createComentario(data: Comentario,publicacionId:number): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "publicacion/crearComentario/" + publicacionId, data, { headers: headers });
  }

  public createRespuesta(data: Comentario,comentarioId:number | null | undefined): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + "publicacion/comentarios/" + comentarioId + "/respuesta", data, { headers: headers });
  }

  public getComentarios(publicacionId:number): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<any>(API_ENDPOINT + "publicacion/cogerComentarios/" + publicacionId, { headers: headers });
  }


  public getPublicaciones(filtro: Filtro): Observable<any> {
    const storedToken = this.Utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    let params = new HttpParams();
    if (filtro.fechaPublicacion) {
      params = params.set('fechaPublicacion', filtro.fechaPublicacion.toISOString().split('T')[0]); // Asegúrate de que esto corresponde a cómo tu API espera la fecha.
    }
    if (filtro.pagina !== undefined) {
      params = params.set('pagina', filtro.pagina.toString());
    }
    if (filtro.tamano !== undefined) {
      params = params.set('tamano', filtro.tamano.toString());
    }

    return this.httpClient.get<any>(API_ENDPOINT + "publicacion/getPublicaciones", { headers: headers, params: params });
  }

}
