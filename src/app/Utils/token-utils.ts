import { Router } from '@angular/router';
import { LoginService } from '../Service/Login/login.service';
import { ErrorService } from '../Service/Error/error.service';
import { MENSAJE_ERROR_401 } from './Constants';
import { utils } from 'src/app/Utils/utils';

export function validateStoredToken(loginService: LoginService, router: Router, errorService: ErrorService) {
  let storedToken: string = localStorage.getItem('authToken') || '';
      if (storedToken.startsWith('"') && storedToken.endsWith('"')) {
        storedToken = storedToken.slice(1, -1);
      }
      console.log(storedToken)
    if (storedToken) {
        loginService.validateToken(storedToken).subscribe((response:any) => {

            if (response.message === "Token válido y usuario recordado") {
                router.navigate(['/home']);
            }  else if (response.error === "Token inválido") {
                router.navigate(['/inicio']);
            }
        },
        error => {
          localStorage.removeItem("authToken");
          errorService.throwError(MENSAJE_ERROR_401);
          router.navigate(['/inicio']);
        }
        );
      }else{
        return;
      }
}
