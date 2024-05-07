import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoginRequest } from 'src/app/Interface/LoginRequest';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_CIUDADES, API_ENDPOINT } from 'src/app/Utils/Constants';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { utils } from 'src/app/Utils/utils';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient,private Utils:utils) { }

  public login(data: LoginRequest): Observable<any> {
    return this.httpClient.post<any>(API_ENDPOINT + "usuario/login", data);
  }



  public obtenerRolesUsuario(): Observable<Set<number>> {
    const storedToken = this.Utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    console.log(headers)
    return this.httpClient.get<Set<number>>(`${API_ENDPOINT}usuario/rolesUsuario`, { headers: headers });
  }



  public obtenerUsuario(): Observable<Usuario> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    return this.httpClient.get<Usuario>(`${API_ENDPOINT}usuario/obtenerUsuario`, { headers: headers });
  }

  public seguirUser(usuarioASeguirId:number): Observable<any> {
    const storedToken = this.Utils.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    return this.httpClient.post<any>(`${API_ENDPOINT}usuario/seguir/${usuarioASeguirId}`, null, { headers: headers, observe: 'response' })
  .pipe(
    map(response => {
      if (response.status === 200) {
        return response.body; // o simplemente return true;
      } else {
        throw new Error('Unexpected response status');
      }
    }),
    catchError(error => {
      console.error('Follow request failed', error);
      return throwError(() => new Error('Follow request failed'));
    })
  );
  }


  public validateToken(token: string): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const body = {
      token: token
    };
    return this.httpClient.post<any>(API_ENDPOINT + "usuario/verificarToken", body, { headers: headers });
  }

  public  enviarCodigoRecuperacion(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.post(API_ENDPOINT + "usuario/enviarCodigo", null, { params: params });
  }

  public  verificarCodigoRecuperacion(email: string, codigo: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('codigo', codigo);
    return this.httpClient.post<any>(API_ENDPOINT + "usuario/verificarCodigo", null, { params: params });
  }

  public actualizarContraseña(email: string, password: string, repetirPassword: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('password', password).set('repetirPassword', repetirPassword);
    return this.httpClient.put<any>(API_ENDPOINT + "usuario/actualizarPassword", null, { params: params });
  }

  public buscarUsuarios(nombre: string): Observable<any> {
    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);
    return this.httpClient.get<any>(API_ENDPOINT + "usuario/buscarUsuario?nombre="+nombre, { headers: headers });
  }

  public getUsuario(id:number):Observable<any>{

    const storedToken = this.Utils.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${storedToken}`);

    return this.httpClient.get<any>(API_ENDPOINT + "usuario/getUsuario/" + id, { headers: headers });
  }
}
