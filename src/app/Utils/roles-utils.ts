import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginService } from '../Service/Login/login.service';

export function obtenerIdRol(usuarioService: LoginService): Observable<number> {
  return usuarioService.obtenerRolesUsuario().pipe(
    map(rolesArray => {
      const roles = new Set(rolesArray);
      console.log(roles);
      if (roles.has(1)) {
          return 1;
      } else if (roles.has(2)) {
          return 2;
      } else if (roles.has(3)) {
          return 3;
      } else {
          throw new Error('Rol desconocido');
      }
  }),
    catchError(error => {
        console.error('Error al obtener los roles', error);
        throw error;
    })
);
}
