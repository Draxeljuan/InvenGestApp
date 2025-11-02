import { Component } from '@angular/core';
import { LogoutService } from '../logout.service';
import { VentaService } from '../services/ventas.service';
import { HistorialVentasService } from '../services/historial-ventas.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-ventas',
  standalone: true, // Evita errores en componentes independientes
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent {
  /** Variables de búsqueda y gestión de clientes */
  terminoBusquedaCliente: string = '';
  clientesFiltrados: any[] = [];
  clienteSeleccionado: any = null;
  errorBusquedaCliente: boolean = false;

  /** Control para mostrar el formulario de nuevo cliente */
  mostrarFormularioCliente: boolean = false;
  nuevoCliente: any = { primerNombre: '', primerApellido: '' };

  /** Variables de búsqueda y gestión de productos */
  terminoBusquedaProducto: string = '';
  productosFiltrados: any[] = [];
  carrito: any[] = [];

  /** Variables para mostrar la factura */
  mostrarModalFactura: boolean = false;
  idVentaGenerada: number | null = null;

  /** Variables para mostrar las últimas ventas */
  ventas: any[] = [];

  constructor(
    public logoutService: LogoutService,
    private ventaService: VentaService,
    private historialVentas: HistorialVentasService,
  ) { }

  ngOnInit(): void {
    this.cargarUltimasVentas();
  }

  // Búsqueda de clientes en tiempo real
  buscarCliente(): void {
    if (this.terminoBusquedaCliente.trim().length < 3) {
      this.clientesFiltrados = [];
      return; //  Solo filtra si la búsqueda tiene al menos 3 caracteres
    }

    this.ventaService.obtenerClientes()
      .pipe(debounceTime(300))
      .subscribe({
        next: (clientes) => {
          this.clientesFiltrados = clientes.filter(cliente =>
            cliente.primerNombre.toLowerCase().includes(this.terminoBusquedaCliente.toLowerCase()) ||
            cliente.primerApellido.toLowerCase().includes(this.terminoBusquedaCliente.toLowerCase())
          );
        },
        error: (err) => {
          console.error(" Error al buscar clientes", err);

          if (!err.message.includes("4081 (DB_TIMEOUT)")) {
            alert("⚠ No se pudo obtener los clientes. Verifique su conexión.");
          }
        }
      });
  }

  // Validar Busqueda de Cliente
  validarYBuscarCliente(): void {
    const patronTexto = /[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;

    if (!this.terminoBusquedaCliente || !patronTexto.test(this.terminoBusquedaCliente)) {
      this.errorBusquedaCliente = true;
      return;
    }

    this.errorBusquedaCliente = false;
    this.buscarCliente(); // tu método ya existente
  }

  // Seleccionar un cliente de la lista
  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = { ...cliente };
    this.clientesFiltrados = [];
  }

  // Mostrar formulario para crear nuevo cliente
  mostrarFormularioNuevoCliente(): void {
    this.mostrarFormularioCliente = true;
    this.nuevoCliente = { primerNombre: this.terminoBusquedaCliente, primerApellido: '' };
  }

  // Registrar un nuevo cliente en el sistema
  registrarCliente(): void {
    if (!this.nuevoCliente.primerNombre.trim() || !this.nuevoCliente.primerApellido.trim()) {
      alert("Debe ingresar nombre y apellido.");
      return;
    }

    this.ventaService.registrarCliente(this.nuevoCliente).subscribe({
      next: (clienteRegistrado) => {
        alert("✅ Cliente registrado correctamente!");
        this.clienteSeleccionado = clienteRegistrado;
        this.mostrarFormularioCliente = false;
        this.clientesFiltrados = [];
      },
      error: (err) => {
        console.error(" Error al registrar cliente", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudo registrar el cliente. Verifique su conexión.");
        }
      }
    });
  }


  // Búsqueda de productos en tiempo real
  buscarProducto(): void {
    if (this.terminoBusquedaProducto.trim().length < 3) {
      this.productosFiltrados = [];
      return; // Solo filtra si la búsqueda tiene al menos 3 caracteres
    }

    this.ventaService.buscarProductosPorNombre(this.terminoBusquedaProducto)
      .pipe(debounceTime(300)) // Evita llamadas constantes al backend
      .subscribe({
        next: (productos) => {
          this.productosFiltrados = productos;
        },
        error: (err) => {
          console.error(" Error al buscar productos", err);

          if (!err.message.includes("4081 (DB_TIMEOUT)")) {
            alert("⚠ No se pudo obtener los productos. Verifique su conexión.");
          }
        }
      });
  }

  // Agregar producto al carrito
  agregarAlCarrito(producto: any): void {
    const existente = this.carrito.find(item => item.idProducto === producto.idProducto);
    if (existente) {
      if (existente.cantidad < producto.stock) {
        existente.cantidad++;
      } else {
        alert("Stock insuficiente para agregar más unidades.");
      }
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }

  // Cambiar cantidad de productos en el carrito
  cambiarCantidad(item: any, cambio: number): void {
    const index = this.carrito.findIndex(p => p.idProducto === item.idProducto);
    if (index !== -1) {
      if (this.carrito[index].cantidad + cambio > 0 && this.carrito[index].cantidad + cambio <= this.carrito[index].stock) {
        this.carrito[index].cantidad += cambio;
      } else if (this.carrito[index].cantidad + cambio > this.carrito[index].stock) {
        alert("No puedes exceder el stock disponible.");
      }
    }
  }

  // Eliminar producto del carrito
  removerDelCarrito(item: any): void {
    this.carrito = this.carrito.filter(p => p.idProducto !== item.idProducto);
  }

  // Calcular el subtotal de la venta
  calcularSubtotal(): number {
    return this.carrito.reduce((total, item) => total + item.precioVenta * item.cantidad, 0);
  }


  // Calcular el total de la venta
  calcularTotal(): number {
    return this.calcularSubtotal();
  }

  // Obtener el ID del usuario actual desde el token JWT
  obtenerUsuarioActual(): number | null {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idUsuario;
    } catch (error) {
      console.error("Error al obtener el usuario desde el JWT:", error);
      return null;
    }
  }

  // Confirmar y registrar la venta en el sistema
  confirmarVenta(): void {
    if (this.carrito.length === 0) {
      alert("⚠ No puedes realizar una venta sin productos.");
      return;
    }

    if (!this.clienteSeleccionado) {
      alert("⚠ Debes seleccionar un cliente antes de continuar.");
      return;
    }

    const idUsuario = this.obtenerUsuarioActual();
    if (!idUsuario) {
      alert("⚠ Error: No se pudo obtener el usuario. Verifica la autenticación.");
      return;
    }

    const venta = {
      idCliente: this.clienteSeleccionado?.idCliente,
      idUsuario: idUsuario,
      fecha: new Date().toISOString(),
      total: this.calcularSubtotal(),
      detalles: this.carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precioUnitario: item.precioVenta,
        subtotal: item.precioVenta * item.cantidad
      }))
    };

    this.ventaService.crearVenta(venta).subscribe({
      next: (ventaConfirmada) => {
        if (!ventaConfirmada.idVenta) {
          alert("⚠ Error: No se pudo obtener el ID de la venta. Contacta con un administrador.");
          return;
        }

        console.log("✅ ID de venta recibido en el frontend:", ventaConfirmada.idVenta);

        alert("✅ Venta registrada correctamente!");
        this.carrito = [];
        this.idVentaGenerada = ventaConfirmada.idVenta;
        this.mostrarModalFactura = true;
      },
      error: (err) => {
        console.error(" Error al registrar la venta", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudo confirmar la venta. Verifique su conexión.");
        }
      }
    });
  }


  /** Descargar factura desde el backend */
  descargarFactura(): void {
    console.log("📄 Solicitando factura para venta ID:", this.idVentaGenerada);

    if (!this.idVentaGenerada) {
      alert("⚠ Error: No se ha registrado la venta correctamente.");
      return;
    }

    this.ventaService.generarFactura(this.idVentaGenerada).subscribe({
      next: (pdf) => {
        if (!pdf) {
          alert("⚠ Error: No se pudo generar la factura. Contacta con un administrador.");
          return;
        }

        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_${this.idVentaGenerada}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(" Error al generar la factura", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudo descargar la factura. Verifique su conexión.");
        }
      }
    });

    this.cerrarModal();
  }


  /** Cerrar el modal si el usuario no quiere descargar la factura */
  cerrarModal(): void {
    this.mostrarModalFactura = false;
  }

  /** Cargar Ventas Recientes */
  cargarUltimasVentas(): void {
    this.historialVentas.listarVentas().subscribe({
      next: (data) => {
        console.log("✅ Ventas obtenidas:", data);
        this.ventas = data.slice(-2).reverse();
      },
      error: (err) => {
        console.error(" Error al obtener ventas", err);

        if (!err.message.includes("4081 (DB_TIMEOUT)")) {
          alert("⚠ No se pudo obtener las ventas recientes. Verifique su conexión.");
        }
      }
    });
  }



}