import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from 'src/app/Interface/Task';
import { API_ENDPOINT } from 'src/app/Utils/Constants';
import { utils } from 'src/app/Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {

  constructor(private httpClient: HttpClient,private Utils:utils) { }

  // Función para guardar o actualizar una tarea
  public saveOrUpdate(data: Task): Observable<any> {
    const storedToken = this.Utils.getToken();  // Ajustar si usas otro método para obtener el token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.post<any>(API_ENDPOINT + 'task/saveOrUpdate', data, { headers: headers });
  }

  // Función para obtener las tareas del usuario logueado
  public getTasksForLoggedUser(): Observable<Task[]> {
    const storedToken = this.Utils.getToken();  // Ajustar si usas otro método para obtener el token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<Task[]>(API_ENDPOINT + 'task/getTasks', { headers: headers });
  }
}
