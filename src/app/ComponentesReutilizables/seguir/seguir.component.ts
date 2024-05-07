import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoginService } from 'src/app/Service/Login/login.service';

@Component({
  selector: 'app-seguir',
  templateUrl: './seguir.component.html',
  styleUrls: ['./seguir.component.css']
})
export class SeguirComponent implements OnInit {

  @Input() sigueAutor: boolean | undefined;
  @Input() userId!: number;
  @Output() cambioSeguir = new EventEmitter<{ userId: number, sigueAutor: boolean }>();

  constructor(private usuarioService:LoginService) { }

  ngOnInit(): void {
  }


  public seguirUser(){
    this.usuarioService.seguirUser(this.userId).subscribe({
      next: (response) => {
        this.sigueAutor = !this.sigueAutor; // Alternar el estado de sigueAutor
        this.cambioSeguir.emit({ userId: this.userId, sigueAutor: this.sigueAutor });
      },
      error: (error) => {
        this.sigueAutor = !this.sigueAutor; // Alternar el estado de sigueAutor
        this.cambioSeguir.emit({ userId: this.userId, sigueAutor: this.sigueAutor });
      }
    });

  }





}
