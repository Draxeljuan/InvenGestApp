import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { MovimientoInventarioService } from '../services/movimiento-inventario.service'; 
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-movimientos-inventario',
  imports: [RouterLinkActive, RouterModule, CommonModule],
  templateUrl: './movimientos-inventario.component.html',
  styleUrl: './movimientos-inventario.component.css'
})
export class MovimientosInventarioComponent implements OnInit {
  movimientos: any[] = []; 
  constructor(
    public logoutService: LogoutService,
    private movimientoInventarioService: MovimientoInventarioService, 
    public router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.movimientoInventarioService.listarMovimientos().subscribe({
      next: (data) => {
        console.log("Movimientos obtenidos:", data); 
        this.movimientos = data;
      },
      error: (err) => {
        console.error("Error al obtener los movimientos de inventario:", err);
      }
    });
  }
}