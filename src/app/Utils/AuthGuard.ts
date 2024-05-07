// auth.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { LoginService } from '../Service/Login/login.service';
import { Observable, catchError, map, of } from 'rxjs';
import { ErrorService } from '../Service/Error/error.service';
import { MENSAJE_ERROR_401 } from './Constants';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router,private errorService:ErrorService) {}
  public storedToken:string = JSON.parse(localStorage.getItem("authToken") || '{}');

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {


    if (route.routeConfig && route.routeConfig.path === '' && this.storedToken) {
      // Comportamiento para la ruta raíz
      return this.handleRootRoute(this.storedToken);
    } else {
      // Comportamiento para otras rutas
      return this.validateToken(this.storedToken);
    }
  }

  private handleRootRoute(token: string): Observable<boolean> {
    return this.loginService.validateToken(token).pipe(
      map(response => {
        if (response.message === "Token válido" || response.message === "Token válido y usuario recordado") {
          this.router.navigate(['/home']);
          return false;
        } else {
          return true;
        }
      }),
      catchError(() => {
        return of(true);
      })
    );
  }

  private validateToken(token: string): Observable<boolean> {
    if (!token) {
      this.router.navigate(['/inicio']);
      return of(false);
    }
    return this.loginService.validateToken(token).pipe(
      map(response => response.message === "Token válido" || response.message === "Token válido y usuario recordado"),
      catchError(() => {
        this.router.navigate(['/inicio']);
        this.errorService.throwError(MENSAJE_ERROR_401);
        return of(false);
      })
    );
  }
}
