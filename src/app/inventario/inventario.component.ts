import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { InventarioService } from '../services/inventario.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-inventario',
  imports: [CommonModule, RouterModule, RouterLinkActive, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  activeTab: string = 'register';
  nuevoProducto: any = { stock: 0, idCategoria: null, estado: '' };
  nuevaCategoria: any = { nombre: '', descripcion: '' };
  productoActualizado: any = {};
  productoDescontinuado: string = '';
  categorias: any[] = [];
  mostrarFormularioCategoria: boolean = false; // Controla la visibilidad del formulario de categoría
  estados: any[] = []; // Estado dinámico desde el backend

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarEstados();
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  toggleFormularioCategoria(): void {
    this.mostrarFormularioCategoria = !this.mostrarFormularioCategoria;
  }

  cargarCategorias(): void {
    this.inventarioService.obtenerCategorias().subscribe({
      next: (data) => {
        console.log("Categorías obtenidas:", data);
        this.categorias = data;
      },
      error: (err) => console.error("Error al obtener categorías:", err)
    });
  }

  crearNuevaCategoria(): void {
    if (!this.nuevaCategoria.nombre || !this.nuevaCategoria.descripcion) {
      alert("Debe ingresar un nombre y una descripción para la categoría.");
      return;
    }
  
    this.inventarioService.crearNuevaCategoria(this.nuevaCategoria).subscribe({
      next: (response) => {
        console.log("Nueva categoría registrada:", response);
        alert("Categoría creada correctamente!");
        this.cargarCategorias(); // 🔥 Actualizar la lista de categorías
        this.nuevaCategoria = { nombre: '', descripcion: '' }; // Limpiar el formulario
      },
      error: (err) => console.error("Error al registrar la nueva categoría:", err)
    });
  }

  cargarEstados(): void {
    this.inventarioService.obtenerEstados().subscribe({
      next: (data) => {
        console.log("Estados obtenidos:", data);
        this.estados = data;
      },
      error: (err) => console.error("Error al obtener estados:", err)
    });
  }

  calcularEstado(): void {
    if (this.nuevoProducto.stock > 10) {
      this.nuevoProducto.estado = 'Normal';
    } else if (this.nuevoProducto.stock > 0) {
      this.nuevoProducto.estado = 'Bajo';
    } else {
      this.nuevoProducto.estado = 'Sin Stock';
    }
  }

  registrarProducto(): void {
    this.inventarioService.registrarProducto(this.nuevoProducto).subscribe({
      next: (response) => {
        console.log("Producto registrado:", response);
        alert("Producto registrado correctamente!");
        this.nuevoProducto = {}; // Limpiar el formulario después del registro
      },
      error: (err) => console.error("Error al registrar producto:", err)
    });
  }

  actualizarProducto(): void {
    this.inventarioService.actualizarProducto(this.productoActualizado.id, this.productoActualizado).subscribe({
      next: (response) => {
        console.log("Producto actualizado:", response);
        alert("Producto actualizado correctamente!");
      },
      error: (err) => console.error("Error al actualizar producto:", err)
    });
  }

  descontinuarProducto(): void {
    this.inventarioService.descontinuarProducto(this.productoDescontinuado).subscribe({
      next: () => {
        console.log("Producto descontinuado:", this.productoDescontinuado);
        alert("Producto descontinuado correctamente!");
      },
      error: (err) => console.error("Error al descontinuar producto:", err)
    });
  }
}