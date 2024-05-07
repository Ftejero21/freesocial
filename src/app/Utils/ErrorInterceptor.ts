import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorService } from '../Service/Error/error.service';
import { MENSAJE_ERROR_400_USER_AND_PASSWORD, MENSAJE_ERROR_BAD_CODIGO, MENSAJE_ERROR_BAD_EMAIL, MENSAJE_ERROR_BAD_UPDATE, MENSAJE_ERROR_DESCRIPTION_LIMIT, MENSAJE_ERROR_EMAIL_EXIST,  MENSAJE_ERROR_EMPTY_EMAIL_FORGET, MENSAJE_SUCCESS_CREATE, MENSAJE_SUCCESS_CREATE_EDUCATION, MENSAJE_SUCCESS_RESTE_PASSWORD, MENSAJE_SUCCESS_UPDATE, MENSAJE_SUCCESS_UPDATE_EDUCATION } from './Constants';
import { GoodRequestService } from '../Service/GoodRequest/good-request.service';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService,private goodRequestService: GoodRequestService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      tap(event => {

        if (event instanceof HttpResponse && event.body.message === "contraseña Actualizada") {
          this.goodRequestService.throwSuccess(MENSAJE_SUCCESS_RESTE_PASSWORD);
        }else if(event instanceof HttpResponse && event.body.message === "Usuario actualizado con éxito"){
          this.goodRequestService.throwSuccess(MENSAJE_SUCCESS_UPDATE);
        }else if(event instanceof HttpResponse && event.body.message === "Usuario registrado con éxito"){
          this.goodRequestService.throwSuccess(MENSAJE_SUCCESS_CREATE);
        }else if(event instanceof HttpResponse && event.body.message === "Educación actualizada con éxito"){
          this.goodRequestService.throwSuccess(MENSAJE_SUCCESS_UPDATE_EDUCATION);
        }else if(event instanceof HttpResponse && event.body.message === "Educación guardada con éxito"){
          this.goodRequestService.throwSuccess(MENSAJE_SUCCESS_CREATE_EDUCATION);
        }else if(event instanceof HttpResponse && event.body.message === "Experiencia guardada con éxito"){
          this.goodRequestService.throwSuccess(event.body.message);
        }else if(event instanceof HttpResponse && event.body.message === "Experiencia actualizada con éxito"){
          this.goodRequestService.throwSuccess(event.body.message);
        }else if(event instanceof HttpResponse && event.body.message === "Experiencia eliminada con éxito."){
          this.goodRequestService.throwSuccess(event.body.message);
        }else if(event instanceof HttpResponse && event.body.message === "Educación eliminada con éxito."){
          this.goodRequestService.throwSuccess(event.body.message);
        }

      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error === "error.unknown") {
          this.errorService.throwError(MENSAJE_ERROR_400_USER_AND_PASSWORD);
        }else if (Array.isArray(error.error.messages) && error.error.messages.length > 0) {
          if (error.error.messages[0] === "El email esta vacio por favor ingrese un email valido.") {
            this.errorService.throwError(MENSAJE_ERROR_EMPTY_EMAIL_FORGET);
          }else if (error.error.messages[0] === "El email no esta registrado por favor registrese.") {
            this.errorService.throwError(MENSAJE_ERROR_BAD_EMAIL);
          }

        }else if (error.error.message === "Código invalido o expirado.") {
          this.errorService.throwError(MENSAJE_ERROR_BAD_CODIGO);
        }else if (error.error === "error.datos.personales.bad") {
          this.errorService.throwError(MENSAJE_ERROR_BAD_UPDATE);
        }else if (error.error === "error.user.exist") {
          this.errorService.throwError(MENSAJE_ERROR_EMAIL_EXIST);

        }else if(error.error === "error.longitud.description"){
          this.errorService.throwError(MENSAJE_ERROR_DESCRIPTION_LIMIT);
        }
        return throwError(error);
      })
    );
  }
}
