import { N } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { data } from 'jquery';
import { ImageCroppedEvent } from 'ngx-image-cropper';
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
import { RegistroService } from 'src/app/Service/Registro/registro.service';
import { ActualizarService } from 'src/app/Service/actualizar/actualizar.service';
import { FormValidationUtils } from 'src/app/Utils/form-validation.utils';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit,AfterViewInit,OnChanges {
  @Input() operacion!: string;
  @Input() usuario!: Usuario;
  @Output() actualizacionExitosa = new EventEmitter<boolean>()
  @Output() modalClosed = new EventEmitter();
  @Output() messageResponse = new EventEmitter<string>()
  @Input() educacionActualizar!: Educacion | null;
  @Input() experienciaActualizar!: ExperienciaLaboral | null;
  @Input() proyectoActualizar!: Proyecto | null;
  public imagenPerfilBase64: string | null = null;
  public imagenPerfilVistaPrevia: string | null = null;
  public imagenBackgroundVistaPrevia: string | null = null;
  public UsuarioActualizar!:Usuario
  public imagenPrevisualizacionProyecto: string = '';
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public conteoCaracteres: number = 0;
  mostrarInputLink: boolean = false;
  public conteoCaracteresEducacion: number = 0;
  public educacion!:Educacion
  public experiencia!:ExperienciaLaboral;
  public proyecto!:Proyecto;
  public nuevaAptitud: string = '';
  public sombraActiva: boolean = false;
  public mostrarInput = false;
  public habilidadesPrincipalesEducacion: string[] = [];
  public tiposEmpleo: string[] = [];
  public tipoUbicacion:string[] = [];
  public cargoActual: boolean = false;
  constructor(private actualizarService:ActualizarService,private educacionService:EducacionService
    ,private experienciaService:ExperienciaService , private proyectoService:ProyectoService) { }

  ngOnInit(): void {
    this.conteoCaracteres = 0;
    this.UsuarioActualizar = JSON.parse(JSON.stringify(this.usuario));


  }

  ngAfterViewInit(): void {
    this.UsuarioActualizar = JSON.parse(JSON.stringify(this.usuario));
    this.inicializarFreelancerData();
    if(this.operacion === 'experienciaLaboral' && this.experienciaActualizar?.id == null){
      this.experienciaActualizar = null;
    }
    if(this.usuario.imagenPerfil){
      this.UsuarioActualizar.imagenPerfilBase64 = this.usuario.imagenPerfil
      this.imagenPerfilVistaPrevia = 'data:image/jpeg;base64,' + this.usuario.imagenPerfil;

    }
    if(this.usuario && this.usuario.descripcion){
      this.conteoCaracteres = this.usuario.descripcion?.length

    }

    if(this.usuario.imagenBackground){
      this.UsuarioActualizar.imagenBackgroundBase64 = this.usuario.imagenBackground
      this.imagenBackgroundVistaPrevia = 'data:image/jpeg;base64,' + this.usuario.imagenBackground;

    }
    console.log(this.experienciaActualizar)
    this.tipoUbicacion = [
      'Presencial',
      'Híbrido',
      'Remoto'
    ]

    this.tiposEmpleo = [
      'Autónomo',
      'Jornada Completa',
      'Jornada Parcial',
      'Temporal',
      'Contrato por Obra o Servicio',
      'Prácticas',
      'Beca',
      'Teletrabajo',
      'Freelance',
      'Voluntariado',
      'Formación Dual',
      'Contrato Indefinido',
      'Contrato Temporal',
      'Contrato de Relevo',
      'Contrato en Prácticas',
      'Contrato para la Formación y el Aprendizaje',
      'Empleo Público'
      // Puedes añadir más tipos de empleo según tus necesidades específicas
    ];

    this.iniciarEducacion();
    this.iniciarExperiencia();
    this.iniciarProyecto();
  }

  toggleInput() {
    this.mostrarInput = true;
  }

  actualizarFechaFinPorCargoActual(): void {
    if (this.cargoActual) {
      if(this.experiencia){
        this.experiencia.fechaFin = null;
      }

    }
  }

  eliminarAptitudEducacion(index: number) {
    this.habilidadesPrincipalesEducacion.splice(index, 1);
  }

  handleEnter(tipo:string) {

    if(tipo == "añadirEducacion"){
      if(this.educacionActualizar != null && this.nuevaAptitud.trim() !== ''){
        this.educacionActualizar.habilidadesPrincipalesEducacion?.push(this.nuevaAptitud.trim());
        console.log(this.educacionActualizar);
        this.nuevaAptitud = '';
      }else{
        this.educacion.habilidadesPrincipalesEducacion?.push(this.nuevaAptitud.trim());
        this.nuevaAptitud = '';
      }

    }else if(tipo == "experienciaLaboral"){

      if(this.experienciaActualizar != null && this.nuevaAptitud.trim() !== ''){
        this.experienciaActualizar.habilidadesPrincipalesExperiencia?.push(this.nuevaAptitud.trim());
        console.log(this.experienciaActualizar);
        this.nuevaAptitud = '';

      }else{
        this.experiencia?.habilidadesPrincipalesExperiencia?.push(this.nuevaAptitud.trim());
        this.nuevaAptitud = '';
      }
    }else if(tipo == "proyecto"){
      if(this.experienciaActualizar != null && this.nuevaAptitud.trim() !== ''){
        this.experienciaActualizar.habilidadesPrincipalesExperiencia?.push(this.nuevaAptitud.trim());
        console.log(this.experienciaActualizar);
        this.nuevaAptitud = '';

      }else{
        this.proyecto.habilidadesPrincipalesProyecto?.push(this.nuevaAptitud.trim());
        this.nuevaAptitud = '';
      }
    }



  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['educacionActualizar']) {
      this.iniciarEducacion();
    }else if (changes['experienciaActualizar']) {
      this.iniciarExperiencia();
    }else if(changes['proyectoActualizar' || 'proyecto']){
      console.log("entrando")
      this.iniciarProyecto();
    }

  }

  public iniciarExperiencia():void{
    if(this.experienciaActualizar && this.experienciaActualizar.id !== null){
      if(this.experienciaActualizar && this.experienciaActualizar.descripcion){
        this.conteoCaracteres = this.experienciaActualizar.descripcion?.length;
      }
      this.experiencia = { ...this.experienciaActualizar };
      if(this.experienciaActualizar.fechaFin == null){
        this.cargoActual = true
      }else{
        this.cargoActual = false
      }
      console.log(this.experiencia)
    }else{
    this.experiencia = {
      id:null,
      cargo:'',
      descripcion:'',
      fechaFin:null,
      fechaInicio:null,
      habilidadesPrincipalesExperiencia:[],
      modoEmpleo:'',
      nombreEmpresa:'',
      tipoEmpleo:'',
      ubicacion:'',
      sector:'',
      tiempoTrabajado:''
    }
    console.log(this.experiencia)
  }
}
public iniciarProyecto(): void {
  this.conteoCaracteres = 0;
  if (this.proyectoActualizar && this.proyectoActualizar.id != null) {
    if (this.proyectoActualizar && this.proyectoActualizar.descripcion) {
      this.conteoCaracteres = this.proyectoActualizar.descripcion.length;
    }
    if(this.proyectoActualizar.link){
      this.mostrarInputLink = true;
    }
    if(this.proyectoActualizar.imagenProyecto){
      this.imagenPrevisualizacionProyecto = 'data:image/jpeg;base64,' + this.proyectoActualizar.imagenProyecto
    }

    this.proyecto = { ...this.proyectoActualizar };
    console.log(this.proyecto)
  } else {
    this.proyecto = {
      id: null,
      titulo: '',
      descripcion: '',
      link:'',
      fechaFin: null,
      fechaInicio: null,
      habilidadesPrincipalesProyecto: [],
      imagenProyecto: null,
      imagenProyectoBase64: null
    }
    this.imagenPrevisualizacionProyecto = ''
    console.log(this.proyecto)
  }
}

  triggerFileInput(): void {
    // Simula el clic en el input de archivo
    document.getElementById('fileInput')?.click();
  }

  fileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result as string;
        this.imagenPrevisualizacionProyecto = base64; // Guarda el resultado completo para previsualización
        const base64Data = base64.split(',')[1]; // Extrae solo la parte Base64 para el proyecto
        this.proyecto.imagenProyectoBase64 = base64Data; // Almacena en tu objeto proyecto
      };
      reader.readAsDataURL(file);
    }
  }


  public iniciarEducacion(): void {
    if (this.educacionActualizar && this.educacionActualizar.id !== null) {
      if(this.educacionActualizar && this.educacionActualizar.descripcion){
        this.conteoCaracteres = this.educacionActualizar.descripcion?.length;
      }
      this.educacion = { ...this.educacionActualizar };
      console.log(this.educacion)
    } else {

      this.educacion = {
        id: null,
        institucion: "",
        nota:null,
        fechaInicio: null,
        fechaFin: null,
        titulo: "",
        disciplinaAcademica: "",
        actividadesExtraEscolares: "",
        descripcion: "",
        habilidadesPrincipalesEducacion: [],
      };

      console.log(this.educacion)
    }
  }

  public closeModal() {
    this.mostrarInput=false
    this.conteoCaracteres = 0;
    this.modalClosed.emit();
    this.experiencia =  this.experiencia = {
      id:null,
      cargo:'',
      descripcion:'',
      fechaFin:null,
      fechaInicio:null,
      habilidadesPrincipalesExperiencia:[],
      modoEmpleo:'',
      nombreEmpresa:'',
      tipoEmpleo:'',
      ubicacion:'',
      sector:'',
      tiempoTrabajado:''
    }
    this.proyecto = this.proyecto = {
      id: null,
      titulo: '',
      descripcion: '',
      link:'',
      fechaFin: null,
      fechaInicio: null,
      habilidadesPrincipalesProyecto: [],
      imagenProyecto: null,
      imagenProyectoBase64: null

    }
    this.imagenPrevisualizacionProyecto = '',
    this.educacion = {
      id: null,
      institucion: "",
      nota:null,
      fechaInicio: null,
      fechaFin: null,
      titulo: "",
      disciplinaAcademica: "",
      actividadesExtraEscolares: "",
      descripcion: "",
      habilidadesPrincipalesEducacion: [],
    };
    this.educacionActualizar = null;
    this.experienciaActualizar = null;
    this.proyectoActualizar = null;
    ($('#operacionesModal') as any).modal('hide');
  }

  public mostrarInputLinkFunction() {
    this.mostrarInputLink = true;
  }

  public actualizarOperacion(nuevaOperacion: string) {
    this.operacion = nuevaOperacion;
    // Cualquier otra lógica que necesites ejecutar cuando la operación cambia.
  }

  public activarSombra() {
    this.sombraActiva = true;
  }

  public desactivarSombra() {
    this.sombraActiva = false;
  }

  public inicializarFreelancerData():void{
    if (!this.usuario.freelancerData) {
      this.usuario.freelancerData = {
        habilidadesPrincipales: [],
        habilidades:[],
        intereses:[]
        // Inicializa aquí otras propiedades necesarias de 'freelancerData'
      };
    } else if (!this.usuario.freelancerData.habilidadesPrincipales) {
      this.usuario.freelancerData.habilidadesPrincipales = [];
    }
  }
  manejarCambioImagenPerfil(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPerfilVistaPrevia = e.target.result; // Actualiza la vista previa
        const imagenPerfilBase64 = e.target.result.split(',')[1];
        if (imagenPerfilBase64) {
          this.UsuarioActualizar.imagenPerfilBase64 = imagenPerfilBase64;
          // Llamar a tu servicio para actualizar la imagen en el backend
        }
        if(this.usuario.imagenBackground != null){
          this.UsuarioActualizar.imagenBackgroundBase64 = this.usuario.imagenBackground;
        }
      };
      reader.readAsDataURL(archivo);
    }
  }

  public actualizarConteoCaracteres(tipo:string): void {
    if(tipo === 'datosPersonales'){
      if (this.UsuarioActualizar && this.UsuarioActualizar.descripcion) {
        // Contar todos los caracteres en la descripción
        this.conteoCaracteres = this.UsuarioActualizar.descripcion.length;
      } else {
        this.conteoCaracteres = 0;
      }
    }else if(tipo === 'añadirEducacion'){
      if(this.educacion && this.educacion.descripcion){
        this.conteoCaracteres = this.educacion.descripcion.length;
      }else{
        this.conteoCaracteres = 0;
      }
    }else if(tipo === 'experienciaLaboral'){
      if(this.experiencia && this.experiencia.descripcion){
        this.conteoCaracteres = this.experiencia.descripcion.length;
      }else{
        this.conteoCaracteres = 0;
      }
    }else if(tipo === 'proyecto'){
      if(this.proyecto && this.proyecto.descripcion){
        this.conteoCaracteres = this.proyecto.descripcion.length;
      }else{
        this.conteoCaracteres = 0;
      }
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault(); // Prevenir el comportamiento por defecto
    event.stopPropagation(); // Prevenir la propagación del evento
    // Aquí puedes añadir lógica adicional, como efectos visuales
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        // Crear un objeto de evento simulado con la estructura esperada por manejarCambioImagenBackground
        const eventSimulado: any = {
            target: {
                files: files
            }
        };

        this.manejarCambioImagenBackground(eventSimulado as any);
    }
  }


  manejarCambioImagenBackground(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (archivo) {

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenBackgroundVistaPrevia = e.target.result;
        const imagenBackgroundBase64 = e.target.result.split(',')[1];
        if (imagenBackgroundBase64) {
          this.UsuarioActualizar.imagenBackgroundBase64 = imagenBackgroundBase64;
        }
        if(this.usuario.imagenPerfil != null){
          this.UsuarioActualizar.imagenPerfilBase64 = this.usuario.imagenPerfil;
        }

      };
      reader.readAsDataURL(archivo);
    }
  }


  actualizarImagenPerfil(readerEvent: any) {
    const binaryString = readerEvent.target.result;
    const imagenPerfilBase64 = binaryString.split(',')[1];  // Elimina el prefijo de la URL de datos (data:image/*;base64,)

    if (imagenPerfilBase64) {
      this.UsuarioActualizar.imagenPerfilBase64 = imagenPerfilBase64;
    }

    if(this.usuario.imagenBackground != null){
      this.UsuarioActualizar.imagenBackgroundBase64 = this.usuario.imagenBackground;
    }


  }

  public agregarAptitud(): void {
    if (this.nuevaAptitud) {
      // Asegúrate de que el arreglo exista
      if (!this.UsuarioActualizar.freelancerData) {
        this.UsuarioActualizar.freelancerData = { habilidadesPrincipales: [],intereses:[],habilidades:[] };
      } else if (!this.UsuarioActualizar.freelancerData.habilidadesPrincipales) {
        this.UsuarioActualizar.freelancerData.habilidadesPrincipales = [];
      }

      // Ahora puedes añadir la habilidad de forma segura
      this.UsuarioActualizar.freelancerData.habilidadesPrincipales?.push(this.nuevaAptitud);
      this.nuevaAptitud = '';
    }
    console.log(this.UsuarioActualizar.freelancerData?.habilidadesPrincipales);
  }

  public eliminarAptitud(index: number, tipo: string): void {

    if(this.educacionActualizar != null && tipo === 'educacion'){
      this.educacionActualizar?.habilidadesPrincipalesEducacion?.splice(index,1)
    } else if (tipo === 'freelancerData') {
      this.UsuarioActualizar.freelancerData?.habilidadesPrincipales?.splice(index, 1);
    }else if(this.experienciaActualizar != null && tipo === 'experiencia'){
      this.experienciaActualizar?.habilidadesPrincipalesExperiencia?.splice(index,1)
    }
  }


  public eliminarImagen(campo: string): void {
    if (campo === 'perfil') {

      if(this.usuario.imagenBackground != null){
        this.UsuarioActualizar.imagenBackgroundBase64 = this.usuario.imagenBackground;
      }
      this.UsuarioActualizar.imagenPerfilBase64 = null;
      this.imagenPerfilVistaPrevia = null;
      console.log(this.UsuarioActualizar)
    } else if (campo === 'fondo') {
      if(this.usuario.imagenPerfil != null){
        this.UsuarioActualizar.imagenPerfilBase64 = this.usuario.imagenPerfil;
      }
      this.UsuarioActualizar.imagenBackgroundBase64 = null;
      this.imagenBackgroundVistaPrevia = null;
    }
  }

  public descargarImagen(): void {
    if (this.imagenBackgroundVistaPrevia) {
      // Si imagenBackgroundVistaPrevia no es null, procede con la descarga
      const enlace = document.createElement('a');
      enlace.href = this.urlDesdeBase64(this.imagenBackgroundVistaPrevia);
      enlace.download = 'imagen.png';
      enlace.click();
      enlace.remove();
    } else {
      console.error('No hay imagen para descargar');
    }
  }

  private urlDesdeBase64(base64: string): string {
    // Convertir base64 a blob si es necesario
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'image/png' });
    return URL.createObjectURL(blob);
  }


  public actualizar(tipo:string){

     if (!FormValidationUtils.validarCampos(this.operacion)) {
       return;
      }

    if(tipo === "añadirEducacion"){
      this.educacionService.saveEducacion(this.educacion).subscribe((data:any) =>{
        if (data.message === "Educación actualizada con éxito" || data.message === "Educación guardada con éxito") {
          this.actualizacionExitosa.emit(true);
          this.messageResponse.emit(data.message);
          this.closeModal();
        } else {
          this.actualizacionExitosa.emit(false);
          this.messageResponse.emit(data.message);
        }
      }, error => {
        // Manejo de errores
        console.error('Error en la actualizacion', error.error);
      });
    }else if(tipo === 'experienciaLaboral'){
      this.experienciaService.saveOrUpdate(this.experiencia).subscribe((data:any) =>{
        if (data.message === "Experiencia actualizada con éxito" || data.message === "Experiencia guardada con éxito") {
          this.actualizacionExitosa.emit(true);
          this.messageResponse.emit(data.message);
          this.closeModal();
        } else {
          this.actualizacionExitosa.emit(false);
          this.messageResponse.emit(data.message);
          this.closeModal();
        }
      }, error => {
        if (error.error.messages[0] === 'La fecha de inicio no puede ser futura para una experiencia actual.'){
          this.errorMessage = 'La fecha de inicio no puede ser futura para una experiencia actual.';
        }else if (error.error.messages[0] === 'La fecha de inicio no puede ser posterior a la fecha de fin.'){
          this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
        }else if (error.error.messages[0] === 'La fecha de inicio es incoherente con la experiencia actual.'){
          this.errorMessage = 'La fecha de inicio es incoherente con la experiencia actual.';
        }else if (error.error.messages[0] === 'La fecha de fin no puede ser futura a la fecha actual.'){
          this.errorMessage = 'La fecha de fin no puede ser futura a la fecha actual.';
        }
        setTimeout(() => {
          this.errorMessage = null;
        }, 2000);
      })
    }else if(tipo === 'proyecto'){
      this.proyectoService.saveOrUpdate(this.proyecto).subscribe((data:any) =>{
        if (data.message === "proyecto actualizado con éxito" || data.message === "proyecto guardado con éxito") {
          this.actualizacionExitosa.emit(true);
          this.messageResponse.emit(data.message);
          this.closeModal();
        }
      })


    }else if(tipo === 'actualizarDatosPersonales' || tipo === 'actualizarAptitudes' || tipo === 'actualizarImagenPerfil' || tipo === 'actualizarImagenBackground'){
      this.actualizarService.saveOrUpdate(this.UsuarioActualizar).subscribe((data: any) => {
        if (data.message === "Usuario actualizado con éxito") {
          this.actualizacionExitosa.emit(true);
          this.messageResponse.emit(data.message);
          this.closeModal();
        } else {
          this.actualizacionExitosa.emit(false);
          this.messageResponse.emit(data.message);
        }
      }, error => {
        // Manejo de errores
        console.error('Error en la actualizacion', error.error);
      });
    }
  }

  public borrar(tipo:string){
    console.log("borrar")
    if(tipo === "añadirEducacion"){
      if(this.educacionActualizar?.id){
        this.educacionService.deleteEducacion(this.educacionActualizar.id).subscribe((data:any) =>{
          if (data.message === "Educación eliminada con éxito.") {
            this.actualizacionExitosa.emit(true);
            this.messageResponse.emit(data.message);
            this.closeModal();
          }
        })
      }

    }else if(tipo === "experienciaLaboral"){
      if(this.experienciaActualizar?.id){
        this.experienciaService.deleteExperiencia(this.experienciaActualizar.id).subscribe((data:any) => {
          if (data.message === "Experiencia eliminada con éxito.") {
            this.actualizacionExitosa.emit(true);
            this.messageResponse.emit(data.message);
            this.closeModal();
          }
        })
      }
    }
  }


}
