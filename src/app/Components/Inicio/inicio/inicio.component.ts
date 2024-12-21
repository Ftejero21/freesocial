import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorService } from 'src/app/Service/Error/error.service';
import { LoginService } from 'src/app/Service/Login/login.service';
import { trigger,  style, transition, animate, keyframes, state } from '@angular/animations';
import { Route, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
declare var bootstrap: any; // Esto es para tener acceso al objeto de Bootstrap.
import { ChangeDetectorRef } from '@angular/core';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { MatChipInputEvent } from '@angular/material/chips';
import { RegistroService } from 'src/app/Service/Registro/registro.service';
import { MENSAJE_ERROR_BAD_EMAIL, MENSAJE_ERROR_EMPTY_EMAIL_FORGET } from 'src/app/Utils/Constants';
import { GoodRequestService } from 'src/app/Service/GoodRequest/good-request.service';
import { CiudadesServiceService } from 'src/app/Service/Ciudades/ciudades-service.service';
import { error } from 'jquery';
import { validateStoredToken } from 'src/app/Utils/token-utils';
import { GoogleAuthServiceService } from 'src/app/Service/GoogleAuthService/google-auth-service.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
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
    trigger('caidaConRebote', [
      transition(':enter', [
        animate('1.2s ease-in', keyframes([
          style({ transform: 'translateY(-100%)', opacity: 0, offset: 0 }),         // Inicia fuera de pantalla
          style({ transform: 'translateY(0)', opacity: 1, offset: 0.6 }),           // Termina la caída al 60% del tiempo total
          style({ transform: 'translateY(-10%)', opacity: 1, offset: 0.75 }),       // Primer rebote
          style({ transform: 'translateY(0)', opacity: 1, offset: 0.85 }),          // Después del primer rebote
          style({ transform: 'translateY(-5%)', opacity: 1, offset: 0.92 }),        // Segundo rebote
          style({ transform: 'translateY(0)', opacity: 1, offset: 0.96 }),          // Después del segundo rebote
          style({ transform: 'translateY(-2%)', opacity: 1, offset: 0.98 }),        // Tercer rebote
          style({ transform: 'translateY(0)', opacity: 1, offset: 1.0 }),           // Asentamiento final
        ]))
      ]),

    ]),
    trigger('slideOut', [
      transition(':leave', [
        animate('0.5s ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }), // Inicia fuera de la pantalla a la derecha
        animate('0.5s ease-out', style({ transform: 'translateX(0)', opacity: 1 })) // Anima hacia la posición final
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ transform: 'translateX(100%)', opacity: 0 })) // Anima hacia fuera de la pantalla a la derecha
      ])
    ]),

  ]
})
export class InicioComponent implements OnInit {
  public tokenChecked:boolean = false;
  public isPasswordShown: boolean = false;
  public loginForm!: FormGroup;
  provincias: any[] = [];
  provinciasFiltradas: any[] = [];
  contrasenasValidas: boolean = true;
  public showContent: boolean = true;
  public selectedRoleId: number | null = null;
  public loading: boolean = false;
  private errorTimer: any;
  private successTimer: any;
  @ViewChild('errorModal') errorModal!: ElementRef;
  public mostrarBotonActualizar: boolean = false;
  public successMessage:string | null = null;
  private errorSubscription!: Subscription;
  private successSubscription!: Subscription;
  public mostrarInputContrasena: boolean = false;
  public showAlert: boolean = false;
  public isPasswordVisible: boolean = false;
  public isConfirmPasswordVisible: boolean = false;
  public errorMessage: string | null = null;
  public email: string = '';
  public currentStep: 'welcome' | 'personalData' = 'welcome';
  public nuevaContrasena: string = '';
  public validarContrasena: string = '';
  public mostrarInputVerificarCodigo = false;
  public mostrarInputEmail = true;
  public mostrarRegistro = false;
  public mostrarDatosPersonales = false;
  public mostrarChips: boolean = false;
  public codigoVerificacion: string = '';
  public typewriterDisplay: string = '';
  public confirmPassword: string = '';
  public mostrarBotonGuardar: boolean = false;
  private auth2: any;
  usuarioBloqueado: boolean = false;

  usuarioRegistro: Usuario = {
    id: null,
    aparicionBusqueda:0,
    nombreCompleto:'',
    email: '',
    password: '',
    roles: [],
    estado:'',
    datosPersonales: {
      nombre: '',
      apellidos: '',
      telefono: '',
      fechaNacimiento: '',
      ciudad: ''
    }

  };


  @ViewChild('forgotPasswordModalRef') forgotPasswordModalRef!: ElementRef;
  private modalInstance: any;

  ngAfterViewInit() {
    // Inicializa el modal de Bootstrap cuando Angular termine de renderizar el componente.
    this.modalInstance = new bootstrap.Modal(this.forgotPasswordModalRef.nativeElement);
  }


  constructor(private fb: FormBuilder,
    private loginService: LoginService,private registerService:RegistroService , private errorService: ErrorService,private goodRequestService:GoodRequestService,  private router: Router,private cdr: ChangeDetectorRef
  , private ciudadesService:CiudadesServiceService,private googleAuth: GoogleAuthServiceService) { }

  ngOnInit(): void {
    this.errorService.clearError();
    this.goodRequestService.clearSuccess();
    this.verificarEstadoUsuario();
    console.log(this.usuarioBloqueado)
    if(this.usuarioBloqueado){
      validateStoredToken(this.loginService, this.router,this.errorService);
    }
    this.cogerCiudades();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Aquí puedes añadir más validadores si lo necesitas
      password: ['', Validators.required],
      recordado: [false]
    });
    this.loadStoredCredentials();

    this.errorSubscription = this.errorService.error$.subscribe(error => {
      if (error) {
        clearTimeout(this.successTimer); // Limpiar el temporizador de éxito
        this.errorMessage = error;
        this.errorTimer = setTimeout(() => this.errorMessage = null, 3000);
      }
    });

    this.successSubscription = this.goodRequestService.success$.subscribe(success => {
      if (success) {
        clearTimeout(this.errorTimer); // Limpiar el temporizador de error
        this.successMessage = success;
        this.successTimer = setTimeout(() => this.successMessage = null, 3000);
      }
    });
  }

  cerrarPopup(): void {
    this.loginForm.reset();
    this.usuarioBloqueado = false;
  }


  verificarEstadoUsuario(): void {
    this.loginService.obtenerEstadoUsuarioActual().subscribe({
      next: (estado: string) => {
        console.log(estado)
        if (estado === 'Bloqueado') {
          console.log(estado)
          this.usuarioBloqueado = true;
        }
      },
      error: (error) => {
        console.error('Error al obtener el estado del usuario:', error);
      }
    });
  }


  public inicio(): void {
    if (this.mostrarChips) {
      // Si estamos mostrando los chips, queremos volver al formulario de datos personales.
      this.mostrarChips = false;
      this.mostrarBotonGuardar = false;

      setTimeout(() => {
        this.mostrarDatosPersonales = true;
      }, 500); // Ajusta este tiempo según sea necesario
    }
    else if (this.mostrarDatosPersonales) {
      // Navegamos de los datos personales al contenido anterior.
      this.mostrarDatosPersonales = false;
      setTimeout(() => {
        this.showContent = true;
      }, 1000);
    } else {
      // Esto maneja el caso de volver al inicio desde la selección de roles.
      this.selectedRoleId = null;
      this.usuarioRegistro.roles = [];
      this.reiniciarFormulario();
      this.confirmPassword = '';
      this.mostrarRegistro = !this.mostrarRegistro;
    }
  }


  public onRoleChange(roleId: number): void {
    this.selectedRoleId = roleId;
    // Aquí puedes manejar más lógica si necesitas hacer algo más al seleccionar
  }

  private reiniciarFormulario() {
    this.usuarioRegistro = {
      id: null,
      email: '',
      estado:'',
      nombreCompleto:'',
      password: '',
      aparicionBusqueda:0,
      roles: [],
      datosPersonales: {
        nombre: '',
        apellidos: '',
        telefono: '',
        fechaNacimiento: '',
        ciudad: ''
      },

    };
  }

  public onNextClicked(): void {
    if (this.selectedRoleId && !this.mostrarDatosPersonales) {
      this.usuarioRegistro.roles.push({ id: this.selectedRoleId });
      this.showContent = false;
      setTimeout(() => {
        this.mostrarDatosPersonales = true;
      }, 500);
    }
    // Cuando se clickea la flecha por segunda vez y los datos personales están siendo mostrados.
    else if (this.mostrarDatosPersonales && this.isFormValid()) {
      this.errorService.clearError(); // Limpiar mensajes de error
      this.goodRequestService.clearSuccess();
      this.registerService.saveOrUpdate(this.usuarioRegistro).subscribe((data:any) =>{
          const token = data.token;
          this.mostrarDatosPersonales = false;
          setTimeout(() => {
            this.mostrarChips = true;
          }, 1000);
          console.log("data: ",data)
          localStorage.setItem('authToken', JSON.stringify(token));
          this.router.navigate(['/perfil/null']);
      },error => {
        console.error('Error en el registro', error);

      }
      )

    }
  }



  public isFormValid(): boolean {
    const datosCompletos = this.usuarioRegistro.datosPersonales.nombre !== '' &&
                         this.usuarioRegistro.datosPersonales.apellidos !== '' &&
                         this.usuarioRegistro.datosPersonales.ciudad !== '' &&
                         this.usuarioRegistro.datosPersonales.telefono !== '' &&
                         this.usuarioRegistro.datosPersonales.fechaNacimiento !== '' &&
                         this.usuarioRegistro.email !== '' &&
                         this.usuarioRegistro.password !== '' &&
                         this.confirmPassword !== '';

  const contrasenasValidas = this.usuarioRegistro.password === this.confirmPassword;
  if(this.confirmPassword != '' && this.usuarioRegistro.password != ''){
    this.contrasenasValidas = this.usuarioRegistro.password === this.confirmPassword;

  }

  return datosCompletos && contrasenasValidas;
  }


  cogerCiudades() {
    this.ciudadesService.obtenerProvincias().subscribe(
      data => {

        this.provincias = data;
        console.log(data)
      },
      error => {
        console.error('Error al cargar provincias:', error);
      }
    );
  }

  filtrarProvincias() {
    if (Array.isArray(this.provincias)) {
      this.provinciasFiltradas = this.usuarioRegistro.datosPersonales.ciudad ?
        this.provincias.filter(p =>
          p.ciudades && p.ciudades.toLowerCase().includes(this.usuarioRegistro.datosPersonales.ciudad.toLowerCase())
        ) : [];
    }
  }

  seleccionarProvincia(provincia: any) {
    this.usuarioRegistro.datosPersonales.ciudad = provincia.ciudades;
    this.provinciasFiltradas = [];
  }


  public enviarCodigo(): void {
    this.loading = true;
    this.loginService.enviarCodigoRecuperacion(this.email).subscribe(
      response => {
        this.loading = false; // Ocultar el spinner

        if (response.message === "Código de recuperación enviado.") {
          this.mostrarInputEmail = false;
          this.mostrarInputVerificarCodigo = true; // Ocultar el input de contraseña y mostrar el de verificación

        } else {
            console.warn("Respuesta inesperada:", response);
        }
      },
      error => {
        this.loading = false; // Ocultar el spinner en caso de error
          console.error("Error desconocido al enviar el código:", error);
      }
    );
  }

  toggleRegistro(): void {
    this.mostrarRegistro = true;

  }

 public onChangeToken(value: string): void {
    if (value.length === 10) {
        this.verificarCodigoEmail();
    }
  }

  public verificarCodigoEmail(): void {
      this.loading = true
    this.loginService.verificarCodigoRecuperacion(this.email, this.codigoVerificacion).subscribe(
      response => {
        console.log(response)
          if (response.message === "Código verificado correctamente.") {
              this.loading = false
              this.mostrarInputVerificarCodigo = false
              this.mostrarInputContrasena = true;
              this.mostrarBotonActualizar = true;


          }else{
            this.loading = false
          }
      },
      error => {
        console.error("Hubo un error al verificar el código:", error);
        if (error.error) {
            // Mostrar la estructura del error
            console.error("Detalle del error:", error.error);

            // Ejemplo de cómo manejar un mensaje de error específico
            if (error.error.message === "Código invalido o expirado.") {
                // Manejar este error específico aquí
            }
        }
        this.loading = false;
    }
  );
  }

  public actualizarContrasena(): void {
    if (this.nuevaContrasena && this.validarContrasena && this.email) {
      this.loginService.actualizarContraseña(this.email, this.nuevaContrasena, this.validarContrasena).subscribe(
        response => {
          if (response.message === "contraseña Actualizada") {

            this.modalInstance.hide();
            this.email = '';
            this.codigoVerificacion = '';
            this.nuevaContrasena = '';
            this.validarContrasena = '';
            this.mostrarInputContrasena = false
            this.mostrarInputVerificarCodigo = false
            this.mostrarBotonActualizar = false
            this.mostrarInputEmail = true
          } else {
            alert("Hubo un problema al actualizar la contraseña. Inténtalo de nuevo.");
          }
        },
        error => {
          console.error("Error al actualizar la contraseña:", error);
          alert("Error al actualizar la contraseña. Por favor, intenta nuevamente.");
        }
      );
    } else {
      alert("Por favor, completa todos los campos.");
    }
  }

  public loadStoredCredentials(): void {
    // Obtener el email y la contraseña cifrados del localStorage
    const encryptedEmail = localStorage.getItem('encryptedEmail');
    const encryptedPassword = localStorage.getItem('encryptedPassword');

    if (encryptedEmail && encryptedPassword) {
      // Descifrar el email y la contraseña
      const decryptedEmail = CryptoJS.AES.decrypt(encryptedEmail, 'secret-key').toString(CryptoJS.enc.Utf8);
      const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, 'secret-key').toString(CryptoJS.enc.Utf8);

      // Establecer los valores descifrados en el formulario
      this.loginForm.get('email')?.setValue(decryptedEmail);
      this.loginForm.get('password')?.setValue(decryptedPassword);

      this.loginForm.get('recordado')?.setValue(true);
    }else{

    }
  }




  public togglePassword(): void {
    this.isPasswordShown = !this.isPasswordShown;
  }






  public onLogin(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.goodRequestService.clearSuccess();
      this.errorService.clearError();
      this.loginService.login(formData).subscribe(
        response => {
          const token = response.token;
          if (this.loginForm.get('recordado')?.value === true) {
            console.log(this.loginForm.get('recordado')?.value)
            const encryptedEmail = CryptoJS.AES.encrypt(formData.email, 'secret-key').toString();
            const encryptedPassword = CryptoJS.AES.encrypt(formData.password, 'secret-key').toString();

            // Guardar el email y la contraseña cifrados en el localStorage
            localStorage.setItem('encryptedEmail', encryptedEmail);
            localStorage.setItem('encryptedPassword', encryptedPassword);
          }else{
            localStorage.removeItem("encryptedEmail");
            localStorage.removeItem("encryptedPassword");
          }

          if (token) {
            // Guarda el token
            localStorage.setItem('authToken', JSON.stringify(token));
            this.router.navigate(['/home']);
          }
        },
        error =>{
          console.error(error)
        }
      );
    }
  }

}
