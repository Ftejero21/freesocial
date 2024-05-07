// src/app/services/token.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class utils {

  constructor() { }

  public getToken(): string {
    let token: string = localStorage.getItem('authToken') || '';

    // Eliminar las comillas dobles si están presentes
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    return token;
  }
}
