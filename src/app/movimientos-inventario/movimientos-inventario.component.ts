import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { MovimientoInventarioService } from '../services/movimiento-inventario.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-movimientos-inventario',
  imports: [RouterLinkActive, RouterModule, CommonModule, FormsModule],
  templateUrl: './movimientos-inventario.component.html',
  styleUrl: './movimientos-inventario.component.css'
})
export class MovimientosInventarioComponent implements OnInit {
  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  filtroFecha: string = '';
  filtroTipo: string = '';

  constructor(
    public logoutService: LogoutService,
    private movimientoInventarioService: MovimientoInventarioService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.movimientoInventarioService.listarMovimientos().subscribe({
        next: (data) => {
            console.log("Movimientos obtenidos:", data);

            this.movimientos = [...data]; // Guardamos la lista original
            this.movimientosFiltrados = this.movimientos.reverse(); // Invertimos el orden directamente

        },
        error: (err) => {
            console.error("⚠ Error al obtener los movimientos de inventario:", err);
        }
    });
}

  filtrarMovimientos(): void {
    this.movimientosFiltrados = this.movimientos.filter(movimiento => {
      const cumpleFecha = this.filtroFecha ? movimiento.fechaMovimiento.startsWith(this.filtroFecha) : true;
      const cumpleTipo = this.filtroTipo ? movimiento.idMovimiento == this.filtroTipo : true;
      return cumpleFecha && cumpleTipo;
    });
  }
}