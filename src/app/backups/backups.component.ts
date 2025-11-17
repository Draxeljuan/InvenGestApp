import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { LogoutService } from '../logout.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  BackupService,
  BackupFile,
  RestoreResult,
} from '../services/backup-service.service';

interface BackupInfo {
  productos?: number;
  ventas?: number;
  movimientos?: number;
  usuarios?: number;
}

interface Confirmaciones {
  backup: boolean;
  perdida: boolean;
  irreversible: boolean;
}

interface DatosRestaurados {
  productos: number;
  ventas: number;
  movimientos: number;
}

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrls: ['./backups.component.css'],
  imports: [FormsModule, CommonModule, RouterModule, RouterLinkActive],
})
export class BackupsComponent implements OnInit {
  // ========== Variables de estado general ==========
  fechaActual: Date = new Date();
  backupsDisponibles: number = 0;
  ultimaRestauracion: string = '';
  
  // ========== Control de archivo ==========
  archivoSeleccionado: File | null = null;
  backupSeleccionadoServidor: BackupFile | null = null;
  isDragging: boolean = false;
  
  // ========== Información del backup ==========
  informacionBackup: BackupInfo | null = null;
  backupsRecientes: BackupFile[] = [];
  
  // ========== Confirmaciones ==========
  confirmaciones: Confirmaciones = {
    backup: false,
    perdida: false,
    irreversible: false
  };
  
  // ========== Estado del proceso de restauración ==========
  procesandoBackup: boolean = false;
  progreso: number = 0;
  mensajeProceso: string = '';
  
  // ========== Resultados de restauración ==========
  restauracionExitosa: boolean = false;
  errorRestauracion: boolean = false;
  mensajeError: string = '';
  datosRestaurados: DatosRestaurados = {
    productos: 0,
    ventas: 0,
    movimientos: 0
  };

  // ========== Estado de carga ==========
  cargandoBackups: boolean = false;
  
  // ========== Estado de creación de backup ==========
  creandoBackup: boolean = false;
  backupCreadoExitoso: boolean = false;
  backupCreadoInfo: any = null;

  constructor(
    private router: Router,
    private backupService: BackupService,
    public logoutService: LogoutService
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarBackupsRecientes();
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  /**
   * Cargar datos iniciales del componente
   */
  cargarDatosIniciales(): void {
    // Obtener información del directorio de backups
    this.backupService.getBackupInfo().subscribe({
      next: (info) => {
        this.backupsDisponibles = info.totalBackups;
      },
      error: (error) => {
        console.error('Error al cargar información de backups:', error);
        this.backupsDisponibles = 0;
      }
    });
    
    // Obtener última restauración desde localStorage
    const ultimaRest = localStorage.getItem('ultimaRestauracion');
    if (ultimaRest) {
      const fecha = new Date(ultimaRest);
      this.ultimaRestauracion = this.formatearFechaCompleta(fecha);
    }
  }

  /**
   * Cargar lista de backups disponibles en el servidor
   */
  cargarBackupsRecientes(): void {
    this.cargandoBackups = true;
    
    // Cargar los backups del servidor
    this.backupService.listBackups().subscribe({
      next: (backups) => {
        this.backupsRecientes = backups.map(backup => ({
          ...backup,
          // El tamaño ya viene formateado desde el backend como sizeMB
        }));
        this.cargandoBackups = false;
      },
      error: (error) => {
        console.error('Error al cargar backups recientes:', error);
        this.backupsRecientes = [];
        this.cargandoBackups = false;
      }
    });
  }

  // ==========================================
  // MÉTODOS PARA CREAR BACKUPS
  // ==========================================

  /**
   * Crear un nuevo backup de la base de datos
   */
  crearNuevoBackup(): void {
    const confirmar = confirm(
      '¿Deseas crear un backup de la base de datos actual?\n\n' +
      'Esto generará un archivo con todos los datos del sistema.'
    );

    if (!confirmar) {
      return;
    }

    this.creandoBackup = true;
    this.backupCreadoExitoso = false;
    this.backupCreadoInfo = null;

    this.backupService.createBackup().subscribe({
      next: (result) => {
        this.creandoBackup = false;
        
        if (result.success) {
          this.backupCreadoExitoso = true;
          
          // Extraer información del backup creado
          const fileName = result.filePath ? 
            result.filePath.split('/').pop() || result.filePath.split('\\').pop() : 
            'backup.sql';
          
          this.backupCreadoInfo = {
            fileName: fileName,
            filePath: result.filePath || '',
            createdDate: new Date().toLocaleString('es-ES')
          };

          // Recargar la lista de backups
          this.cargarDatosIniciales();
          this.cargarBackupsRecientes();
        } else {
          alert(' Error al crear el backup: ' + result.message);
        }
      },
      error: (error) => {
        this.creandoBackup = false;
        alert(' Error al crear el backup: ' + error.message);
        console.error('Error al crear backup:', error);
      }
    });
  }

  /**
   * Volver al estado inicial después de crear un backup
   */
  volverAInicio(): void {
    this.backupCreadoExitoso = false;
    this.backupCreadoInfo = null;
  }

  /**
   * Mostrar la lista de backups disponibles
   */
  mostrarListaBackups(): void {
    this.backupCreadoExitoso = false;
    this.backupCreadoInfo = null;
    this.cargarBackupsRecientes();
  }

  // ==========================================
  // MÉTODOS DE DRAG AND DROP
  // ==========================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  // ==========================================
  // MÉTODOS DE PROCESAMIENTO DE ARCHIVOS
  // ==========================================

  /**
   * Procesar y validar archivo seleccionado
   */
  procesarArchivo(file: File): void {
    // Validar tipo de archivo
    const extensionesPermitidas = ['.json', '.sql', '.zip'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
      alert('Tipo de archivo no permitido. Solo se aceptan archivos .json, .sql o .zip');
      return;
    }

    // Validar tamaño (50MB máximo)
    const tamañoMaximo = 50 * 1024 * 1024; // 50MB en bytes
    if (file.size > tamañoMaximo) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 50MB');
      return;
    }

    this.archivoSeleccionado = file;
    this.backupSeleccionadoServidor = null; // Limpiar selección de servidor
    this.analizarBackup(file);
  }

  /**
   * Analizar el contenido del backup (solo para JSON)
   */
  analizarBackup(file: File): void {
    // Si es un archivo JSON, intentar leerlo para obtener información
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const contenido = JSON.parse(e.target.result);
          this.informacionBackup = {
            productos: contenido.productos?.length || 0,
            ventas: contenido.ventas?.length || 0,
            movimientos: contenido.movimientos?.length || 0,
            usuarios: contenido.usuarios?.length || 0
          };
        } catch (error) {
          console.error('Error al parsear el backup:', error);
          this.informacionBackup = null;
        }
      };
      reader.readAsText(file);
    } else {
      // Para archivos SQL, no mostramos información estimada
      this.informacionBackup = null;
    }
  }

  /**
   * Seleccionar un backup del servidor
   */
  seleccionarBackupServidor(backup: BackupFile): void {
    this.backupSeleccionadoServidor = backup;
    this.archivoSeleccionado = null; // Limpiar archivo local
    
    // Crear un objeto File simulado para mantener compatibilidad con el template
    const blob = new Blob([''], { type: 'application/sql' });
    this.archivoSeleccionado = new File([blob], backup.name, { 
      type: 'application/sql',
      lastModified: new Date(backup.modifiedDate).getTime()
    });
    
    // Ya no mostramos información estimada del contenido
    this.informacionBackup = null;
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN Y CONFIRMACIÓN
  // ==========================================

  /**
   * Verificar si todas las confirmaciones están marcadas
   */
  todasConfirmaciones(): boolean {
    return this.confirmaciones.backup && 
           this.confirmaciones.perdida && 
           this.confirmaciones.irreversible;
  }

  /**
   * Cancelar la selección actual
   */
  cancelarSeleccion(): void {
    this.archivoSeleccionado = null;
    this.backupSeleccionadoServidor = null;
    this.informacionBackup = null;
    this.confirmaciones = {
      backup: false,
      perdida: false,
      irreversible: false
    };
  }

  // ==========================================
  // MÉTODOS DE RESTAURACIÓN
  // ==========================================

  /**
   * Iniciar el proceso de restauración
   */
  iniciarRestauracion(): void {
    if ((!this.archivoSeleccionado && !this.backupSeleccionadoServidor) || !this.todasConfirmaciones()) {
      return;
    }

    // Confirmar con el usuario una última vez
    const confirmar = confirm(
      '¿Estás completamente seguro de que deseas restaurar este backup? ' +
      'Esta acción reemplazará TODOS los datos actuales del sistema.'
    );

    if (!confirmar) {
      return;
    }

    this.procesandoBackup = true;
    this.progreso = 0;
    
    // Si es un backup del servidor, usar el servicio para restaurar
    if (this.backupSeleccionadoServidor) {
      this.restaurarDesdeServidor();
    } else {
      // Si es un archivo local, mostrar mensaje (funcionalidad pendiente)
      this.mensajeError = 'La carga de archivos locales aún no está implementada. Por favor, usa un backup del servidor.';
      this.errorRestauracion = true;
      this.procesandoBackup = false;
    }
  }

  /**
   * Restaurar backup desde el servidor
   */
  restaurarDesdeServidor(): void {
    if (!this.backupSeleccionadoServidor) return;

    // Iniciar animación de progreso
    this.simularProgresoRestauracion();

    // Llamar al servicio para restaurar
    this.backupService.restoreBackup(this.backupSeleccionadoServidor.path).subscribe({
      next: (result: RestoreResult) => {
        this.progreso = 100;
        
        if (result.success) {
          setTimeout(() => {
            this.finalizarRestauracion(true);
          }, 1000);
        } else {
          this.mensajeError = result.message || 'No se pudo completar la restauración.';
          this.finalizarRestauracion(false);
        }
      },
      error: (error) => {
        this.progreso = 100;
        this.mensajeError = error.message || 'Error al restaurar el backup. Por favor, intenta nuevamente.';
        this.finalizarRestauracion(false);
      }
    });
  }

  /**
   * Simular progreso visual durante la restauración
   */
  simularProgresoRestauracion(): void {
    // Paso 1: Validando archivo (0-20%)
    this.mensajeProceso = 'Validando integridad del archivo...';
    this.actualizarProgreso(20, 1500);

    // Paso 2: Extrayendo datos (20-40%)
    setTimeout(() => {
      if (this.procesandoBackup) {
        this.mensajeProceso = 'Extrayendo información del backup...';
        this.actualizarProgreso(40, 2000);
      }
    }, 1500);

    // Paso 3: Limpiando base de datos (40-60%)
    setTimeout(() => {
      if (this.procesandoBackup) {
        this.mensajeProceso = 'Preparando base de datos...';
        this.actualizarProgreso(60, 1800);
      }
    }, 3500);

    // Paso 4: Restaurando información (60-80%)
    setTimeout(() => {
      if (this.procesandoBackup) {
        this.mensajeProceso = 'Restaurando productos, ventas y movimientos...';
        this.actualizarProgreso(80, 2500);
      }
    }, 5300);

    // Paso 5: Verificando integridad (80-95%)
    setTimeout(() => {
      if (this.procesandoBackup) {
        this.mensajeProceso = 'Verificando integridad de los datos...';
        this.actualizarProgreso(95, 1500);
      }
    }, 7800);
  }

  /**
   * Actualizar barra de progreso de forma animada
   */
  actualizarProgreso(objetivo: number, duracion: number): void {
    const incremento = (objetivo - this.progreso) / (duracion / 50);
    const intervalo = setInterval(() => {
      if (this.progreso >= objetivo || !this.procesandoBackup) {
        this.progreso = objetivo;
        clearInterval(intervalo);
      } else {
        this.progreso += incremento;
      }
    }, 50);
  }

  /**
   * Finalizar el proceso de restauración
   */
  finalizarRestauracion(exito: boolean): void {
    this.procesandoBackup = false;

    if (exito) {
      this.restauracionExitosa = true;
      this.errorRestauracion = false;
      
      // Ya no mostramos datos restaurados ya que no tenemos esa info
      this.datosRestaurados = {
        productos: 0,
        ventas: 0,
        movimientos: 0
      };

      // Guardar fecha de última restauración
      localStorage.setItem('ultimaRestauracion', new Date().toISOString());
      
      // Recargar la información de backups
      this.cargarDatosIniciales();
    } else {
      this.restauracionExitosa = false;
      this.errorRestauracion = true;
    }
  }

  /**
   * Resetear el formulario a su estado inicial
   */
  resetearFormulario(): void {
    this.archivoSeleccionado = null;
    this.backupSeleccionadoServidor = null;
    this.informacionBackup = null;
    this.confirmaciones = {
      backup: false,
      perdida: false,
      irreversible: false
    };
    this.procesandoBackup = false;
    this.progreso = 0;
    this.mensajeProceso = '';
    this.restauracionExitosa = false;
    this.errorRestauracion = false;
    this.mensajeError = '';
    this.datosRestaurados = {
      productos: 0,
      ventas: 0,
      movimientos: 0
    };
    this.creandoBackup = false;
    this.backupCreadoExitoso = false;
    this.backupCreadoInfo = null;
    
    // Recargar backups
    this.cargarBackupsRecientes();
  }

  // ==========================================
  // MÉTODOS UTILITARIOS
  // ==========================================

  /**
   * Formatear tamaño de bytes a formato legible
   */
  formatearTamano(bytes: number): string {
    return this.backupService.formatBytes(bytes);
  }

  /**
   * Formatear fecha completa con hora
   */
  formatearFechaCompleta(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Formatear fecha corta (día de la semana)
   */
  formatearFecha(fecha: string | Date): string {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[f.getDay()];
  }
}