import { U } from "@angular/cdk/keycodes";

export class FormValidationUtils {
  // Asume que operacion es un parámetro ahora, ya que no estás dentro de un componente
  public static validarCampos(operacion: string): boolean {
    let camposValidos = true;

    const camposEducacion = ['institucion', 'FechaInicio', 'FechaFin', 'Nota', 'Titulo'];
    const camposExperienciaLaboral = ['cargo', 'tipoEmpleo', 'nombreEmpresa', 'FechaInicio', 'FechaFin'];
    const camposProyecto = ['NombreProyecto', 'FechaInicio', 'FechaFin','link'];

    let camposAValidar:any = [];
    if (operacion === "añadirEducacion") {
      camposAValidar = camposEducacion;
    } else if (operacion === "experienciaLaboral") {
      camposAValidar = camposExperienciaLaboral;
    }else if (operacion === "proyecto") { // Maneja la nueva operación de proyecto
      camposAValidar = camposProyecto;
    }

    // Añade un listener al checkbox de cargoActual
    const cargoActualCheckbox = document.getElementById('cargoActual') as HTMLInputElement;
    if (cargoActualCheckbox) {
      cargoActualCheckbox.addEventListener('change', () => {
        // Revalida FechaFin directamente aquí si se necesita según el estado de cargoActual
        if (operacion === "experienciaLaboral") {
          // Solo revalida para la operación de experienciaLaboral
          camposValidos = this.validarCampo(document.getElementById('FechaFin') as HTMLInputElement) && camposValidos;
        }
      });
    }

    camposAValidar.forEach((campo:any) => {
      const elemento = document.getElementById(campo) as HTMLInputElement;
      camposValidos = this.validarCampo(elemento) && camposValidos;
    });

    return camposValidos;
  }

  // Si necesitas que validarCampo sea accesible fuera, también deberías exportarla
  private static validarCampo(elemento: HTMLInputElement): boolean {
    let esCampoValido = true; // Asume que el campo es válido inicialmente

    elemento.addEventListener('input', () => {
      elemento.style.border = '';
      let mensajeError = elemento.nextElementSibling;
      if (mensajeError && mensajeError.tagName === 'P') {
          mensajeError.remove();
      }
  });

    let mensajeError = elemento ? elemento.nextElementSibling as HTMLParagraphElement : null;
    if (mensajeError && mensajeError.tagName !== 'P') {
      mensajeError = null;

    }

    if (elemento.id === 'link') {
      if (!this.validarUrl(elemento.value)) {

          elemento.style.border = '1px solid red';
          if(mensajeError){
          mensajeError.textContent = 'El link proporcionado no es válido.';
          esCampoValido = false
          }
      }
    } else if (!elemento.value) {
      elemento.style.border = '1px solid red';
      if(mensajeError){
      mensajeError.textContent = 'Debe completar este campo';
      esCampoValido = false;
      }
  }

    if (elemento.id === 'FechaFin' && (document.getElementById('cargoActual') as HTMLInputElement)?.checked) {
      elemento.style.border = '';
      if (mensajeError) {
        mensajeError.remove();
      }
    } else if (!elemento.value) {
      elemento.style.border = '1px solid red';
      esCampoValido = false; // Marca el campo como inválido

      if (!mensajeError) {
        mensajeError = document.createElement('p');
        mensajeError.style.color = 'red';
        mensajeError.style.fontSize = '16px';
        mensajeError.textContent = 'Debe completar este campo';
        elemento.parentNode?.insertBefore(mensajeError, elemento.nextSibling);
      }
    } else {
      elemento.style.border = '';
      if (mensajeError) {
        mensajeError.remove();
      }
    }

    return esCampoValido;
  }

  public static validarUrl(url: string): boolean {
    console.log(url)
    const patronUrl = /^https:\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

    return patronUrl.test(url);
  }
}
