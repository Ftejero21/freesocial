import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoCallDetails } from 'src/app/Interface/VideoCallDetails';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class VideoCallServiceService {

  constructor(private http: HttpClient,private Utils:utils) {}

  getCallDetails(receiverId: string): Observable<VideoCallDetails> {
    const storedToken = localStorage.getItem('authToken'); // Obtener el token JWT almacenado

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    return this.http.post<VideoCallDetails>(`${API_ENDPOINT}videocall/details`, null, {
      headers: headers,
      params: { receiverId: receiverId }
    });
  }
}
