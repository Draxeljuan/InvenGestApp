import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../services/alerta.service';

@Component({
  standalone: true,
  selector: 'app-alertas',
  imports: [RouterModule, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent implements OnInit {
  alertas: any[] = []; // Lista de alertas obtenidas del backend
  filtro: string = ''; // Variable para filtrar alertas por idProducto

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private alertaService: AlertaService // Inyectar el servicio de alertas
  ) {}

  ngOnInit(): void {
    this.cargarAlertas(); // Cargar alertas al iniciar el componente
  }

  cargarAlertas(): void {
    this.alertaService.obtenerAlertas().subscribe({
      next: (data) => {
        console.log("Alertas obtenidas:", data); // Verificar alertas en la consola
        this.alertas = data;
      },
      error: (err) => {
        console.error("Error al obtener la lista de alertas:", err);
      }
    });
  }

  get alertasFiltradas() {
    return this.alertas.filter(alerta =>
      alerta.idProducto.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}