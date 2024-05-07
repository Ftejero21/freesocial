import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string | null | undefined, limit: number = 25, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) { // Verifica si value es undefined, null o vacío
      return '';
    }
    if (value.length > limit) {
      if (completeWords) {
        // Trunca el texto al último espacio completo antes del límite para evitar cortar palabras a la mitad
        limit = value.substr(0, limit).lastIndexOf(' ');
      }
      return `${value.substr(0, limit)}${ellipsis}`;
    } else {
      return value;
    }
  }

}
