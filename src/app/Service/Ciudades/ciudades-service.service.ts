import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT} from 'src/app/Utils/Constants';

@Injectable({
  providedIn: 'root'
})
export class CiudadesServiceService {

  constructor(private httpClient: HttpClient) { }


  public obtenerProvincias(): Observable<any> {
    return this.httpClient.get<any>(`${API_ENDPOINT}ciudades/getAllCitys`);
  }
}
