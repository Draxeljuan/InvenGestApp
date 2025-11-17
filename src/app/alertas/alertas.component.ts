import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../services/alerta.service';
import { ProductoService } from '../services/producto.service';

@Component({
  standalone: true,
  selector: 'app-alertas',
  imports: [RouterModule, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent implements OnInit {
  alertas: any[] = [];
  filtro: string = '';

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private alertaService: AlertaService
  ) { }

  ngOnInit(): void {
    this.limpiarYCargarAlertas(); // Primero limpiar alertas en el backend, luego cargar
    this.cargarAlertas(); // Cargar alertas después de limpiar
  }

  limpiarYCargarAlertas(): void {
    this.alertaService.limpiarAlertas().subscribe(() => {
      this.cargarAlertas();
    });
  }

  cargarAlertas(): void {
    this.alertaService.obtenerAlertasConProducto().subscribe(alertas => {
      console.log(" Alertas activas obtenidas con nombres de productos y tipos:", alertas);

      this.alertas = alertas.map(alerta => ({
        ...alerta,
        tipo: alerta.idTipo === 1 ? "Stock Bajo" : alerta.idTipo === 2 ? "Sin Stock" : "Desconocido" // 🔥 Convertir `idTipo` a texto
      }));
    });
  }
}