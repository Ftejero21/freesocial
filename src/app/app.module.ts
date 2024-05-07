import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './Components/Inicio/inicio/inicio.component';
import { CabeceraComponent } from './Components/cabecera/cabecera.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorInterceptor } from './Utils/ErrorInterceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './Components/Home/home/home.component';
import { PerfilComponent } from './Components/perfil/perfil/perfil.component';
import { FreelancerComponent } from './TipoPerfiles/Freelancer/freelancer/freelancer.component';
import { ContratanteComponent } from './TipoPerfiles/Contratante/contratante/contratante.component';
import { InformacionContactoComponent } from './Components/PopUps/InformacionContacto/informacion-contacto/informacion-contacto.component';
import { AlertComponentsComponent } from './Components/PopUps/AlertComponent/alert-components/alert-components.component';
import { ComponentDescriptionComponent } from './ComponentesReutilizables/componentDescription/component-description/component-description.component';
import { EditarComponent } from './ComponentesReutilizables/Editar/editar/editar.component';
import { ShowPasswordComponent } from './ComponentesReutilizables/showPassword/show-password/show-password.component';
import { LoaderComponent } from './Loaders/loader/loader.component';
import { BotonEliminarComponent } from './ComponentesReutilizables/BotonEliminar/boton-eliminar/boton-eliminar.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageUploaderComponentComponent } from './ComponentesReutilizables/ImageUploaderComponent/image-uploader-component/image-uploader-component.component';
import { DownloadButtonComponent } from './ComponentesReutilizables/download-button/download-button/download-button.component';
import { NewlinePipe } from '../app/Utils/NewlinePipe';
import { SelectorEmoticonosComponentComponent } from './ComponentesReutilizables/SelectorEmoticonosComponent/selector-emoticonos-component/selector-emoticonos-component.component';
import { ContenidoMultimediaComponentComponent } from './Components/PopUps/ContenidoMultimediaComponent/contenido-multimedia-component/contenido-multimedia-component.component';
import { SeguirComponent } from './ComponentesReutilizables/seguir/seguir.component'; // Asegúrate de importar tu pipe aquí
import { MensajeriaComponent } from './Components/mensajeria/mensajeria/mensajeria.component';
import { TruncatePipe } from './Utils/Truncate/truncate.pipe';
import { PublicarComponentComponent } from './ComponentesReutilizables/publicar-component/publicar-component.component';






@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    CabeceraComponent,
    HomeComponent,
    PerfilComponent,
    FreelancerComponent,
    NewlinePipe,
    ContratanteComponent,
    InformacionContactoComponent,
    AlertComponentsComponent,
    ComponentDescriptionComponent,
    EditarComponent,
    ShowPasswordComponent,
    LoaderComponent,
    BotonEliminarComponent,
    ImageUploaderComponentComponent,
    DownloadButtonComponent,
    SelectorEmoticonosComponentComponent,
    ContenidoMultimediaComponentComponent,
    SeguirComponent,
    MensajeriaComponent,
    TruncatePipe,
    PublicarComponentComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ImageCropperModule,


  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
