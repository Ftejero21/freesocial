import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  throwError(message: string) {
    this.errorSubject.next(message);
  }

  clearError() {
    this.errorSubject.next(null);
  }


}
