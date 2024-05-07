import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoodRequestService {
  private successSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public success$ = this.successSubject.asObservable();

  public throwSuccess(message: string) {
    this.successSubject.next(message);
  }

  clearSuccess() {
    this.successSubject.next(null);
  }
}
