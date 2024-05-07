import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { Subject, Subscription, switchMap } from 'rxjs';
import { ContenidoMultimediaComponentComponent } from 'src/app/Components/PopUps/ContenidoMultimediaComponent/contenido-multimedia-component/contenido-multimedia-component.component';
import { Educacion } from 'src/app/Interface/Educacion';
import { ExperienciaLaboral } from 'src/app/Interface/ExperienciaLaboral';
import { Proyecto } from 'src/app/Interface/Proyecto';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { EducacionService } from 'src/app/Service/Educacion/educacion.service';
import { ErrorService } from 'src/app/Service/Error/error.service';
import { ExperienciaService } from 'src/app/Service/Experiencia/experiencia.service';
import { GoodRequestService } from 'src/app/Service/GoodRequest/good-request.service';
import { LoginService } from 'src/app/Service/Login/login.service';
import { ProyectoService } from 'src/app/Service/Proyecto/proyecto.service';
import { FormValidationUtils } from 'src/app/Utils/form-validation.utils';

@Component({
  selector: 'app-freelancer',
  templateUrl: './freelancer.component.html',
  styleUrls: ['./freelancer.component.css']
})
export class FreelancerComponent implements OnInit {
  public usuario!: Usuario;
  public educacion:Educacion[] = [];
  public experiencia:ExperienciaLaboral[] = []
  public proyecto:Proyecto[] = []
  @ViewChild('popup') popupComponent!: ContenidoMultimediaComponentComponent;
  items: any[] = []; // Tus items aquí
  @Input() userId!: number | null;
  imagenSeleccionada: string = '';
  operacionActual: string = '';
  private errorSubscription!: Subscription;
  private successSubscription!: Subscription;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public perfilPropio:boolean = false;
  public educacionActualizar!:Educacion | null;
  public anosTotalesExperiencia: string | null = null;
  public experienciaActualizar!:ExperienciaLaboral | null;
  public proyectoActualizar!:Proyecto | null;
  public textoDescripcionDePrueba = 'Esta es una descripción de prueba. Aquí se puede hablar sobre la experiencia, habilidades y cualquier información relevante del freelancer que podría ser de interés para los potenciales clientes o colaboradores. Este texto es solo un placeholder hasta que se carguen los datos reales del usuario.';
  public datosCargados: boolean = false;
  private userIdSubject = new Subject<number | null>();
  constructor(private usuarioService:LoginService, private errorService: ErrorService
    ,private goodRequestService:GoodRequestService,private educacionService:EducacionService
    ,private experienciaService:ExperienciaService,private proyectoService:ProyectoService,private cdRef: ChangeDetectorRef,private router:Router) { }

  ngOnInit(): void {
      this.errorSubscription = this.errorService.error$.subscribe(error => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => this.errorMessage = null, 3000);
        }
      });

      this.successSubscription = this.goodRequestService.success$.subscribe(success => {
        if (success) {
          this.successMessage = success;
          setTimeout(() => this.successMessage = null, 3000);
        }
      });

      if(this.userId == null){
      this.obtenerUser();
      this.obtenerEducacion();
      this.obtenerExperiencia();
      this.obtenerAñosTotalesExperiencia();
      this.obtenerProyecto();
      }


  }


  public manejarActualizacionExitosa(event: boolean) {
    if (event) {
      this.obtenerUser();
      this.obtenerEducacion();
      this.obtenerExperiencia();
      this.obtenerAñosTotalesExperiencia();
      this.obtenerProyecto();
      window.scrollTo(0, 0);

    }
  }

  limpiarOperacion() {
    this.operacionActual = '';
    this.educacionActualizar = null;
    this.experienciaActualizar = null;
    this.proyectoActualizar = null;
  }

  navegarAMensajeria(usuario: any): void {
    const nombreCompleto = `${usuario.datosPersonales.nombre} ${usuario.datosPersonales.apellidos}`;

    this.router.navigate(['/mensajeria'], {
      queryParams: {
        usuarioId: usuario.id,
        imagenPerfil: usuario.imagenPerfil,
        nombreCompleto: nombreCompleto,
        titular: usuario.titular
      }
    });
  }


  public abrirModalEditarEducacion(educacion: Educacion) {
    this.operacionActual = 'añadirEducacion'; // O cualquier otro valor que necesites
    this.educacionActualizar = educacion;

  }

  public abrirModalEditarProyecto(proyecto:Proyecto){
    this.operacionActual = 'proyecto';
    this.proyectoActualizar = proyecto;
  }

  public abrirModalEditarExperiencia(experiencia:ExperienciaLaboral){
    this.operacionActual = 'experienciaLaboral';
    this.experienciaActualizar = experiencia;
  }

  public obtenerEducacion(id?: number): void {
    this.datosCargados = false;
    this.educacionService.getEducacion(id).subscribe(
      (data: Educacion[]) => {
        this.educacion = data.map(item => ({ ...item, isTruncated: true }));
      },
      (error) => {
        console.error('Error al obtener las educaciones', error);
      }
    );
  }

  public abrirLink(url: string) {
    if (FormValidationUtils.validarUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Manejo de URL inválida
      console.error('URL inválida o no segura.');
    }
  }

  public obtenerExperiencia(id?: number): void {
    this.datosCargados = false;
    this.experienciaService.getExperiencia(id).subscribe(
      (data: ExperienciaLaboral[]) => {
        this.experiencia = data.map(item => ({ ...item }));
      },
      (error) => {
        console.error('Error al obtener las experiencias', error);
      }
    );
  }

  public obtenerProyecto(id?: number): void {
    this.datosCargados = false;
    this.proyectoService.getProyecto(id).subscribe(
      (data: Proyecto[]) => {
        this.proyecto = data.map(item => ({ ...item, isTruncated: true }));
      },
      (error) => {
        console.error('Error al obtener los proyectos', error);
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      const prevUserId = changes['userId'].previousValue;
      const newUserId = changes['userId'].currentValue;
      console.log("Prev userId:", prevUserId, "New userId:", newUserId);

      if(newUserId == 'null'){
          this.perfilPropio = true
          this.obtenerUser();
          this.obtenerEducacion();
          this.obtenerProyecto();
          this.obtenerExperiencia();
          this.obtenerAñosTotalesExperiencia();
      }else{
        this.perfilPropio = false
      }
      const userIdNumber = Number(newUserId);
      console.log(this.userId + " " + newUserId)
      if (!isNaN(userIdNumber) && userIdNumber !== null) {
        this.cargarUsuarioPorId(userIdNumber);
      }
    }
  }

  public obtenerUser(){
    this.datosCargados = false;
      this.usuarioService.obtenerUsuario().subscribe(
        (usuario: Usuario) => {
          this.usuario = usuario;
          setTimeout(() => {
            this.datosCargados = true;
          }, 1000);
        },
        error => {
          console.error('Error al obtener los datos del usuario', error);
        }
      );
  }

  private cargarUsuarioPorId(id: number): void {
    this.datosCargados = false; // Reiniciar este estado para todas las cargas de datos
    this.usuarioService.getUsuario(id).subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
        console.log(this.usuario)
        setTimeout(() => {
          this.datosCargados = true; // Indica que todos los datos están cargados
        }, 1000);
      },
      error => {
        console.error('Error al obtener los datos del usuario', error);
      }
    );
        this.obtenerEducacion(id);
        this.obtenerExperiencia(id);
        this.obtenerProyecto(id);

  }

  public obtenerAñosTotalesExperiencia(){
    this.experienciaService.totalAñosExperiencia().subscribe({
      next: (respuesta) => {
        const data = JSON.parse(respuesta);
        this.anosTotalesExperiencia = data.tiempoTotalTrabajado;
      },
      error: (error) => {
        console.error('Hubo un error al obtener el tiempo total trabajado:', error);
      }
    });
  }
}


