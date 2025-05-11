import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { HistorialVentasService } from '../services/historial-ventas.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-historial-ventas',
  imports: [CommonModule, RouterModule, RouterLinkActive, FormsModule],
  templateUrl: './historial-ventas.component.html',
  styleUrl: './historial-ventas.component.css'
})
export class HistorialVentasComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  detallesVenta: any[] = [];
  filtroFecha: string = '';

  constructor(
    public logoutService: LogoutService,
    private historialVentasService: HistorialVentasService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.historialVentasService.listarVentas().subscribe({
      next: (data) => {
        console.log("Ventas obtenidas:", data);

        this.ventas = [...data]; 
        this.ventasFiltradas = this.ventas.reverse(); 

      },
      error: (err) => {
        console.error("⚠ Error al obtener la lista de ventas:", err);
      }
    });
  }

  verDetalles(idVenta: number): void {
    this.detallesVenta = []; // Limpiar detalles previos

    this.historialVentasService.obtenerVenta(idVenta).subscribe({
      next: (data) => {
        console.log("Detalles de venta obtenidos:", data.detalles);
        this.detallesVenta = data.detalles;
      },
      error: (err) => {
        console.error("Error al obtener los detalles de venta:", err);
      }
    });
  }

  filtrarVentas(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      return this.filtroFecha ? venta.fecha.startsWith(this.filtroFecha) : true;
    });
  }
}
