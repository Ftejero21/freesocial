export interface ChatGrupalCreacion {
  nombreChat: string;
  imagenGrupoBase64: string; // Imagen en formato base64 o cadena vacía
  usuarios: { id: number }[]; // Solo necesitamos los IDs de los usuarios
}
