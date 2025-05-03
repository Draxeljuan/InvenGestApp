import { Component } from '@angular/core';
import { LogoutService } from '../logout.service';
import { VentaService } from '../services/ventas.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(
    public logoutService: LogoutService,
    private ventaService: VentaService
  ) {}

  // Búsqueda de clientes en tiempo real
  buscarCliente(): void {
    if (this.terminoBusquedaCliente.trim().length < 3) {
      this.clientesFiltrados = [];
      return;
    }

    this.ventaService.buscarClientesPorNombre(this.terminoBusquedaCliente).subscribe({
      next: (clientes) => {
        this.clientesFiltrados = clientes.filter(cliente =>
          cliente.primerNombre.toLowerCase().includes(this.terminoBusquedaCliente.toLowerCase()) ||
          cliente.primerApellido.toLowerCase().includes(this.terminoBusquedaCliente.toLowerCase())
        );
      },
      error: (err) => console.error("Error al buscar clientes:", err)
    });
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
        alert("Cliente registrado correctamente!");
        this.clienteSeleccionado = clienteRegistrado;
        this.mostrarFormularioCliente = false;
        this.clientesFiltrados = [];
      },
      error: (err) => console.error("Error al registrar cliente:", err)
    });
  }

  // Búsqueda de productos en tiempo real
  buscarProducto(): void {
    if (this.terminoBusquedaProducto.trim().length < 3) {
        this.productosFiltrados = [];
        return;
    }

    this.ventaService.buscarProductosPorNombre(this.terminoBusquedaProducto).subscribe({
        next: (productos) => {
            this.productosFiltrados = productos; // 🔥 Ahora la búsqueda se hace en el backend
        },
        error: (err) => console.error("Error al buscar productos:", err)
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

  // Calcular impuesto (10% del subtotal)
  calcularImpuesto(): number {
    return this.calcularSubtotal() * 0.10;
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
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificamos el token
        return payload.idUsuario; // Extraemos el `idUsuario`
    } catch (error) {
        console.error("Error al obtener el usuario desde el JWT:", error);
        return null;
    }
}

  // Confirmar y registrar la venta en el sistema
  confirmarVenta(): void {
    if (this.carrito.length === 0) {
        alert("No puedes realizar una venta sin productos.");
        return;
    }

    const idUsuario = this.obtenerUsuarioActual();
    if (!idUsuario) {
        alert("Error: No se pudo obtener el usuario. Verifica la autenticación.");
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
                alert("Error: No se pudo Obtener el ID de la venta. Contacta con un Administrador para Notificar el Problema.");
                return;
            }

            console.log("ID de venta recibido Frontend:", ventaConfirmada.idVenta);

            alert("Venta registrada correctamente!");
            this.carrito = [];
            this.idVentaGenerada = ventaConfirmada.idVenta; // Guardar ID de la venta generada
            this.mostrarModalFactura = true; // Mostrar modal para descargar factura
        },
        error: (err) => console.error("Error al registrar la venta:", err)
    });
  }

  /** Descargar factura desde el backend */
  descargarFactura(): void {
    console.log("📄 Solicitando factura para venta ID:", this.idVentaGenerada); // 🔥 Verificación

    if (!this.idVentaGenerada) {
        alert("Error: No se ha registrado la venta correctamente.");
        return;
    }

    this.ventaService.generarFactura(this.idVentaGenerada).subscribe({
        next: (pdf) => {
            if (!pdf) {
                alert("Error: No se pudo generar la factura. Contacta con un Administrador para Notificar el Problema.");
                return;
            }

            const blob = new Blob([pdf], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura_${this.idVentaGenerada}.pdf`; // 🔥 Ahora usa el ID de la venta
            a.click();
            window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error("Error al generar la factura:", err)
    });

    this.cerrarModal();
}

/** Cerrar el modal si el usuario no quiere descargar la factura */
cerrarModal(): void {
  this.mostrarModalFactura = false;
}

  
}