import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { ProductoService } from '../services/producto.service'; // Importar el servicio de productos
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [RouterLinkActive, RouterModule, FormsModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  productos: any[] = []; // Lista de productos obtenidos del backend
  filtro: string = ''; // Variable para la barra de búsqueda
  filtroValido: boolean = true; // Variable para validar el filtro

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private productoService: ProductoService // Inyectar ProductoService para obtener los productos
  ) { }

  ngOnInit(): void {
    this.cargarProductos(); // Llamar la función al iniciar el componente
  }

  // Función para validar el filtro de búsqueda
  validarFiltro(): void {
    const regex = /^[a-zA-Z0-9]*$/;
    this.filtroValido = regex.test(this.filtro);
  }


  // Función para cargar los productos desde el backend

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        console.log("Productos obtenidos:", data); // Verificar los productos en la consola
        this.productos = data;
      },
      error: (err) => {
        console.error("Error al obtener la lista de productos:", err);
      }
    });
  }

  get productosFiltrados() {
    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
