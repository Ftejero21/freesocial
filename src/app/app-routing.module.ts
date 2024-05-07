import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './Components/Inicio/inicio/inicio.component';
import { HomeComponent } from './Components/Home/home/home.component';
import { AuthGuard } from './Utils/AuthGuard';
import { PerfilComponent } from './Components/perfil/perfil/perfil.component';
import { MensajeriaComponent } from './Components/mensajeria/mensajeria/mensajeria.component';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: InicioComponent  }, // Redirecciona al inicio por defecto
  { path: 'inicio', component: InicioComponent },
  { path: 'home', component: HomeComponent },
  { path: 'perfil/:id',canActivate: [AuthGuard], component: PerfilComponent },
  { path: 'perfil/null', component: PerfilComponent ,canActivate: [AuthGuard]},
  { path: 'mensajeria', component: MensajeriaComponent ,canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
