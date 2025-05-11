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

  /** Tab Activa */
  activeTab: string = 'register';

  /** Gestión de Productos */
  nuevoProducto: any = { stock: 0, idCategoria: null, estado: '' };
  productoActualizado: any = null;
  productoDescontinuado: string = '';
  fechaIngresoInvalida: boolean = false;

  /** Gestión de Categorías */
  categorias: any[] = [];
  nuevaCategoria: any = { nombre: '', descripcion: '' };
  mostrarFormularioCategoria: boolean = false;

  /** Gestión de Estados */
  estados: any[] = [];

  /** Búsqueda de Productos */
  terminoBusqueda: string = '';
  productosFiltrados: any[] = [];

  productoSeleccionado: any = null; // Para almacenar el producto seleccionado

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarEstados();
  }

  /** Alternar Tab */
  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  /** Alternar Formulario de Nueva Categoría */
  toggleFormularioCategoria(): void {
    this.mostrarFormularioCategoria = !this.mostrarFormularioCategoria;
  }

  /** Cargar Categorías */
  cargarCategorias(): void {
    this.inventarioService.obtenerCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error("Error al obtener categorías:", err)
    });
  }

  /** Crear Nueva Categoría */
  crearNuevaCategoria(): void {
    if (!this.nuevaCategoria.nombre || !this.nuevaCategoria.descripcion) {
      alert("Debe ingresar un nombre y una descripción para la categoría.");
      return;
    }

    this.inventarioService.crearNuevaCategoria(this.nuevaCategoria).subscribe({
      next: () => {
        alert("Categoría creada correctamente!");
        this.cargarCategorias();
        this.nuevaCategoria = { nombre: '', descripcion: '' };
      },
      error: (err) => console.error("Error al registrar la nueva categoría:", err)
    });
  }

  /** Cargar Estados */
  cargarEstados(): void {
    this.inventarioService.obtenerEstados().subscribe({
      next: (data) => this.estados = data,
      error: (err) => console.error("Error al obtener estados:", err)
    });
  }

  /** Ajuste Automático del Estado */
  calcularEstado(): void {
    this.nuevoProducto.estado = this.obtenerEstadoSegunStock(this.nuevoProducto.stock);
  }

  calcularEstadoActualizado(): void {
    this.productoActualizado.estado = this.obtenerEstadoSegunStock(this.productoActualizado.stock);
  }

  private obtenerEstadoSegunStock(stock: number): string {
    return stock > 10 ? 'Normal' : stock > 0 ? 'Bajo' : 'Sin Stock';
  }

  /** Registrar Producto */
  registrarProducto(): void {
    // Validación de campos requeridos
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.idCategoria ||
      !this.nuevoProducto.precioVenta || !this.nuevoProducto.costoCompra ||
      !this.nuevoProducto.stock || !this.nuevoProducto.ubicacion ||
      !this.nuevoProducto.fechaIngreso) {

      alert("⚠ Todos los campos son obligatorios. Completa la información antes de continuar.");
      return;
    }

    // Validación de fecha de ingreso
    const fechaSeleccionada = new Date(this.nuevoProducto.fechaIngreso);
    const fechaActual = new Date();

    if (fechaSeleccionada > fechaActual) {
      alert("⚠ La fecha de ingreso no puede estar en el futuro.");
      return;
    }


    // Si las validaciones pasan, registrar el producto
    this.inventarioService.registrarProducto(this.nuevoProducto).subscribe({
      next: () => {
        alert("✅ Producto registrado correctamente!");
        this.nuevoProducto = {};
      },
      error: (err) => console.error("⚠ Error al registrar producto:", err)
    });
  }

  validarFechaIngreso(): void {
    const fechaSeleccionada = new Date(this.nuevoProducto.fechaIngreso);
    const fechaActual = new Date();

    // Determina si la fecha seleccionada es mayor a la fecha actual
    this.fechaIngresoInvalida = fechaSeleccionada > fechaActual;
  }

  /** Buscar Producto por ID o Nombre */
  buscarProducto(): void {
    if (this.terminoBusqueda.trim().length < 3) {
      this.productosFiltrados = [];
      return; // Solo filtra si la búsqueda tiene al menos 3 caracteres
    }

    this.inventarioService.buscarProductosPorNombre(this.terminoBusqueda).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos.filter(producto =>
          producto.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
          producto.idProducto.includes(this.terminoBusqueda)
        ).slice(0, 10); // Limita la cantidad máxima de productos visibles
      },
      error: (err) => console.error("Error al buscar productos:", err)
    });
  }



  /** Seleccionar Producto para Actualizar */
  seleccionarProducto(producto: any): void {
    this.productoActualizado = { ...producto };
    this.productosFiltrados = [];
  }

  /** Actualizar Producto */
  actualizarProducto(): void {
    if (!this.productoActualizado) return;

    this.inventarioService.actualizarProducto(this.productoActualizado.idProducto, this.productoActualizado).subscribe({
      next: () => {
        alert("Producto actualizado correctamente!");
      },
      error: (err) => console.error("Error al actualizar producto:", err)
    });
  }

  /** Descontinuar Producto */
  descontinuarProducto(): void {
    if (!this.productoSeleccionado) {
      alert("Debe seleccionar un producto para descontinuarlo.");
      return;
    }

    this.inventarioService.descontinuarProducto(this.productoSeleccionado.idProducto).subscribe({
      next: () => {
        alert(`Producto "${this.productoSeleccionado.nombre}" marcado como descontinuado correctamente!`);
        this.productoSeleccionado = null;
      },
      error: (err) => {
        alert("Error al descontinuar el producto. Por favor, contacte al administrador del sistema.");
        console.error("Error en la descontinuación:", err);
      }
    });
  }

  /** Seleccionar Producto para Descontinuar */
  seleccionarProductoParaDescontinuar(producto: any): void {
    this.productoSeleccionado = { ...producto };
    this.productosFiltrados = [];
  }

  /** Confirma Descontinuacion */
  confirmarDescontinuacion(): void {
    if (!this.productoSeleccionado) {
      alert("Debe seleccionar un producto para descontinuarlo.");
      return;
    }

    this.inventarioService.descontinuarProducto(this.productoSeleccionado.idProducto).subscribe({
      next: () => {
        alert(`Producto "${this.productoSeleccionado.nombre}" marcado como descontinuado correctamente!`);
        this.productoSeleccionado = null;
      },
      error: (err) => {
        alert("Error al descontinuar el producto. Por favor, contacte al administrador del sistema.");
        console.error("Error en la descontinuación:", err);
      }
    });
  }
}