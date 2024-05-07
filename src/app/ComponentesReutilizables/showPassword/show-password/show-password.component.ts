import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-show-password',
  templateUrl: './show-password.component.html',
  styleUrls: ['./show-password.component.css']
})
export class ShowPasswordComponent implements OnInit {

  public isPasswordShown: boolean = false;
  @Input() inputContext: string = 'show-password';
  @Output() toggle: EventEmitter<void> = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
  }

  togglePassword(): void {
    this.isPasswordShown = !this.isPasswordShown;
    this.toggle.emit();
  }

}
