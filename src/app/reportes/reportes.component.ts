import { Component } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { ReportesService } from '../services/reportes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-reportes',
  imports: [RouterModule, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {

  reportesVentas: any[] = [];
  reportesInventario: any[] = [];
  tipoReporte: string = "ventas";
  fechaInicio: string = "";
  fechaFin: string = "";
  fechaActual: string = new Date().toISOString().split("T")[0];
  fechaMinima: string = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split("T")[0];


  constructor(
    public logoutService: LogoutService,
    private reportesService: ReportesService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.obtenerReportes();
  }

  /** Obtener reportes desde el backend */
  obtenerReportes(): void {
    this.reportesService.obtenerReportes().subscribe({
      next: (reportes: any[]) => {
        this.reportesVentas = reportes.filter(r => r.idTipo === 1); // Ventas
        this.reportesInventario = reportes.filter(r => r.idTipo === 2); // Inventario
      },
      error: (err) => {
        console.error(" Error al obtener reportes", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudieron obtener los reportes. Verifique su conexión.");
        }
      }
    });
  }


  /** Generar un nuevo reporte */
  generarReporte(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert("⚠ Selecciona un rango de fechas.");
      return;
    }

    const fechaInicioObj = new Date(this.fechaInicio);
    const fechaFinObj = new Date(this.fechaFin);
    const fechaActual = new Date();
    const cincoAniosAtras = new Date();
    cincoAniosAtras.setFullYear(fechaActual.getFullYear() - 5);

    // Validar que ninguna fecha esté en el futuro
    if (fechaInicioObj > fechaActual || fechaFinObj > fechaActual) {
      alert("⚠ La fecha de inicio y fin no pueden estar en el futuro.");
      return;
    }

    // Limitar la fecha de inicio a un máximo de 5 años atrás
    if (fechaInicioObj < cincoAniosAtras) {
      alert("⚠ No puedes generar reportes con una fecha de inicio mayor a 5 años atrás.");
      return;
    }

    // Validar que la fecha de inicio no sea mayor a la fecha de fin
    if (fechaInicioObj > fechaFinObj) {
      alert("⚠ La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    // Obtener el ID del usuario (puede venir desde autenticación)
    const idUsuario = this.obtenerIdUsuario();

    this.reportesService.generarReporte(this.tipoReporte, this.fechaInicio, this.fechaFin, idUsuario).subscribe({
      next: () => {
        alert("✅ Reporte generado correctamente!");
        this.obtenerReportes();
      },
      error: (err) => {
        console.error(" Error al generar reporte", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudo generar el reporte. Verifique su conexión.");
        }
      }
    });
  }



  /** Obtener ID del usuario autenticado */
  obtenerIdUsuario(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.id || 1; // Si no hay usuario registrado, usa ID 1 como predeterminado
  }

  /** Descargar un reporte generado */
  descargarReporte(reporte: any): void {
    alert(`✅ El reporte ya se generó y está disponible en tu carpeta de Descargas: ${reporte.rutaArchivo}`);
  }

  /** Eliminar un reporte */
  eliminarReporte(idReporte: number): void {
    if (confirm("¿Seguro que quieres eliminar este reporte?")) {
      this.reportesService.eliminarReporte(idReporte).subscribe({
        next: () => {
          alert("✅ Reporte eliminado correctamente!");
          this.obtenerReportes(); // Actualizamos la lista tras eliminar
        },
        error: (err) => {
          console.error(" Error al eliminar reporte", err);

          if (!err.message.includes("4081 (DB_TIMEOUT)")) {
            alert("⚠ No se pudo eliminar el reporte.");
          }
        }
      });
    }
  }



}
