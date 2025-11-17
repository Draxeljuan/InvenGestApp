import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interfaces para los tipos de respuesta
export interface BackupResult {
  success: boolean;
  filePath: string | null;
  message: string;
}

export interface RestoreResult {
  success: boolean;
  message: string;
}

export interface BackupFile {
  name: string;
  path: string;
  size: number;
  sizeKB: number;
  sizeMB: string;
  createdDate: string;
  modifiedDate: string;
  error?: string;
}

export interface BackupInfo {
  directory: string;
  exists: boolean;
  totalBackups: number;
  totalSizeBytes: number;
  totalSizeMB: string;
  error?: string;
}

export interface DeleteBackupResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private apiUrl = 'http://localhost:8080/api/backup';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo backup de la base de datos
   */
  createBackup(): Observable<BackupResult> {
    return this.http
      .post<BackupResult>(`${this.apiUrl}`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Restaurar la base de datos desde un archivo de backup
   * @param filePath - Ruta del archivo de backup a restaurar
   * @returns Observable con el resultado de la restauración
   */
  restoreBackup(filePath: string): Observable<RestoreResult> {
    const params = new HttpParams().set('filePath', filePath);
    return this.http
      .post<RestoreResult>(`${this.apiUrl}/restore`, null, {
        params,
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Restaurar desde el nombre del archivo (construye la ruta completa)
   * @param fileName - Nombre del archivo de backup
   * @returns Observable con el resultado de la restauración
   */
  restoreBackupByName(fileName: string): Observable<RestoreResult> {
    // Asumiendo que los backups están en el directorio por defecto
    const filePath = `./backups/${fileName}`;
    return this.restoreBackup(filePath);
  }

  /**
   * Listar todos los backups disponibles
   * @returns Observable con la lista de archivos de backup
   */
  listBackups(): Observable<BackupFile[]> {
    return this.http
      .get<BackupFile[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() })
      .pipe(
        map((backups) =>
          backups.sort(
            (a, b) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime()
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener solo los N backups más recientes
   * @param limit - Cantidad de backups a obtener
   * @returns Observable con la lista limitada de backups
   */
  getRecentBackups(limit: number = 5): Observable<BackupFile[]> {
    return this.listBackups().pipe(map((backups) => backups.slice(0, limit)));
  }

  /**
   * Eliminar un archivo de backup específico
   * @param fileName - Nombre del archivo a eliminar
   * @returns Observable con el resultado de la eliminación
   */
  deleteBackup(fileName: string): Observable<DeleteBackupResponse> {
    const params = new HttpParams().set('fileName', fileName);
    return this.http
      .delete<DeleteBackupResponse>(`${this.apiUrl}`, {
        params,
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener información general del directorio de backups
   * @returns Observable con la información del directorio
   */
  getBackupInfo(): Observable<BackupInfo> {
    return this.http
      .get<BackupInfo>(`${this.apiUrl}/info`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Verificar si existe un backup específico
   * @param fileName - Nombre del archivo a verificar
   * @returns Observable<boolean> indicando si existe
   */
  backupExists(fileName: string): Observable<boolean> {
    return this.listBackups().pipe(
      map((backups) => backups.some((backup) => backup.name === fileName))
    );
  }

  /**
   * Obtener un backup específico por nombre
   * @param fileName - Nombre del archivo a buscar
   * @returns Observable con el archivo o null si no existe
   */
  getBackupByName(fileName: string): Observable<BackupFile | null> {
    return this.listBackups().pipe(
      map(
        (backups) => backups.find((backup) => backup.name === fileName) || null
      )
    );
  }

  /**
   * Formatear el tamaño de bytes a formato legible
   * @param bytes - Tamaño en bytes
   * @returns String con el tamaño formateado
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Convertir fecha string a objeto Date
   * @param dateString - Fecha en formato string
   * @returns Objeto Date
   */
  parseBackupDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Manejo centralizado de errores
   * @param error - Error HTTP
   * @returns Observable con el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage =
          'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else if (error.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica la URL del API.';
      } else if (error.status === 500) {
        errorMessage = error.error?.message || 'Error interno del servidor.';
      } else {
        errorMessage = `Error ${error.status}: ${
          error.error?.message || error.message
        }`;
      }
    }

    console.error('Error en BackupService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');

    if (!token || !token.includes('.')) {
      console.error('Error: El token en localStorage no es válido.');
      throw new Error('Usuario no autenticado');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
