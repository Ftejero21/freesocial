import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { data } from 'jquery';
import { LoginService } from 'src/app/Service/Login/login.service';
import { obtenerIdRol } from 'src/app/Utils/roles-utils';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  public userId: any = null;
  public rolId:any = null;
  constructor(private usuarioService: LoginService,private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      console.log(this.userId);
      obtenerIdRol(this.usuarioService).subscribe((idRol:any) => {
        this.rolId = idRol;
      }, (error:any) => {
        console.error('Error al obtener el ID del rol', error);
      });
    });
  }


}
