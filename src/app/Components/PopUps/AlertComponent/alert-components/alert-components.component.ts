import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert-components',
  templateUrl: './alert-components.component.html',
  styleUrls: ['./alert-components.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ]),
  ]
})
export class AlertComponentsComponent implements OnInit {

  @Input() errorMessage!: string | null;
  @Input() successMessage!: string | null;

  constructor() { }

  ngOnInit(): void {
  }

  public get alertClass(): string {
    return this.errorMessage ? 'alert-danger' : 'alert-success';
  }

}
