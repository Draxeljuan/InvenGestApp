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
    this.reportesService.obtenerReportes().subscribe((reportes: any[]) => {
      this.reportesVentas = reportes.filter(r => r.idTipo === 1); // Ventas
      this.reportesInventario = reportes.filter(r => r.idTipo === 2); // Inventario
    });
  }

  /** Generar un nuevo reporte */
  generarReporte(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert("⚠ Selecciona un rango de fechas.");
      return;
    }

    if (this.tipoReporte !== "ventas" && this.tipoReporte !== "inventario") {
      alert("⚠ Selecciona un tipo de reporte válido.");
      return;
    }

    // Obtener el ID del usuario (puede venir desde autenticación)
    const idUsuario = this.obtenerIdUsuario();

    this.reportesService.generarReporte(this.tipoReporte, this.fechaInicio, this.fechaFin, idUsuario).subscribe(() => {
      alert("✅ Reporte generado correctamente!");
      
      this.obtenerReportes();
      
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
      this.reportesService.eliminarReporte(idReporte).subscribe(() => {
        alert("Reporte eliminado correctamente!");
        this.obtenerReportes(); // Actualizamos la lista tras eliminar
      });
    }
  }


}
