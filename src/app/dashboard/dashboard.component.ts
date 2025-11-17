import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, Router } from '@angular/router';
import { LogoutService } from '../logout.service';
import { VentaService } from '../services/ventas.service';
import { MovimientoInventarioService } from '../services/movimiento-inventario.service';
import { AlertaService } from '../services/alerta.service';

interface VentaDiaria {
  fecha: string;
  total: number;
  cantidadVentas: number;
}

interface ProductoTop {
  nombre: string;
  cantidad: number;
  monto: number;
}

interface Movimiento {
  tipo: string;
  producto: string;
  cantidad: number;
  fecha: string;
  usuario: string;
}

interface Venta {
  idVenta: number;
  idUsuario: number;
  fecha: string;
  idCliente: number;
  total: number;
  detalles: DetalleVenta[];
}

interface DetalleVenta {
  idDetalleVenta: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface MovimientoInventario {
  idMovimiento: number;
  idProducto: string | number;
  cantidad: number;
  fechaMovimiento: string;
  idUsuario: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  fechaActual: number = Date.now();

  // Datos para las tarjetas de estadísticas
  ventasHoy: number = 0;
  totalMovimientos: number = 0;
  productosVendidos: number = 0;
  alertasStock: number = 0;

  // Datos para gráficos (se llenan desde el backend)
  ventasSemana: VentaDiaria[] = [];
  productosTopVentas: ProductoTop[] = [];
  movimientosRecientes: Movimiento[] = [];

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private ventaService: VentaService,
    private movimientoInventarioService: MovimientoInventarioService,
    private alertaService: AlertaService
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    // Obteniendo Ventas del día
    this.ventaService.obtenerVentasHoy().subscribe({
      next: (data: Venta[]) => {
        // Validar que data existe y es un array
        if (!data || !Array.isArray(data)) {
          console.warn('No hay datos de ventas del día');
          return;
        }

        this.ventasHoy = data.reduce((sum, v) => sum + (v?.total || 0), 0);

        // Calcular productos vendidos del día usando "detalles"
        this.productosVendidos = data.reduce((sum, v) => {
          const detalles = v?.detalles; // El backend usa "detalles"
          
          if (!detalles || !Array.isArray(detalles)) {
            return sum;
          }
          
          return sum + detalles.reduce((s, d) => {
            const cantidad = typeof d?.cantidad === 'string' ? parseInt(d.cantidad) : (d?.cantidad || 0);
            return s + cantidad;
          }, 0);
        }, 0);
      },
      error: (err) => console.error('Error al cargar ventas del día:', err)
    });

    // Ventas de la semana
    this.ventaService.obtenerVentasSemana().subscribe({
      next: (data: Venta[]) => {
        // Validar que data existe y es un array
        if (!data || !Array.isArray(data)) {
          console.warn('No hay datos de ventas de la semana');
          return;
        }

        this.ventasSemana = data
          .filter((venta) => venta && venta.fecha) // Filtrar ventas válidas
          .map((venta) => ({
            fecha: venta.fecha.split('T')[0],
            total: venta.total || 0,
            cantidadVentas:
              venta.detalles && Array.isArray(venta.detalles)
                ? venta.detalles.reduce(
                    (sum, dv) => sum + (dv?.cantidad || 0),
                    0
                  )
                : 0,
          }));
      },
      error: (err) =>
        console.error('Error al cargar ventas de la semana:', err),
    });

    // Top productos
    this.ventaService.obtenerProductosTop(5).subscribe({
      next: (data: ProductoTop[]) => {
        this.productosTopVentas = data;
      },
      error: (err) => console.error('Error al cargar top productos:', err),
    });

    // Movimientos del día
    this.movimientoInventarioService.obtenerMovimientosHoy().subscribe({
      next: (data: MovimientoInventario[]) => {
        this.totalMovimientos = data?.length || 0;
      },
      error: (err) => {
        console.error('Error al cargar movimientos del día:', err);
        this.totalMovimientos = 0;
      },
    });

    // Movimientos recientes
    this.movimientoInventarioService.obtenerMovimientosRecientes(4).subscribe({
      next: (data: MovimientoInventario[]) => {
        // Validar que data existe y es un array
        if (!data || !Array.isArray(data)) {
          console.warn('No hay datos de movimientos recientes');
          this.movimientosRecientes = [];
          return;
        }

        this.movimientosRecientes = data
          .filter((mov) => mov && mov.idMovimiento) // Filtrar movimientos válidos
          .map((mov) => ({
            tipo: this.obtenerTipoMovimiento(mov.idMovimiento),
            producto: String(mov.idProducto || 'Desconocido'),
            cantidad: mov.cantidad || 0,
            fecha: mov.fechaMovimiento
              ? mov.fechaMovimiento.split('T')[0]
              : 'Sin fecha',
            usuario: this.obtenerNombreRolUsuario(mov.idUsuario),
          }));
      },
      error: (err) => {
        console.error('Error al cargar movimientos recientes:', err);
        // Si hay error 403, mostrar mensaje específico
        if (err.status === 403) {
          console.error(
            'Error 403: No tienes permisos para acceder a movimientos recientes'
          );
          console.error(
            'Verifica que el token JWT sea válido y tenga los permisos necesarios'
          );
        }
        this.movimientosRecientes = [];
      },
    });

    // Número de alertas
    this.alertaService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertasStock = data?.length || 0;
      },
      error: (err) => {
        console.error('Error al cargar alertas:', err);
        this.alertasStock = 0;
      },
    });
  }

  // Método auxiliar para convertir idMovimiento a String
  private obtenerTipoMovimiento(idMovimiento: number): string {
    const tiposMovimiento: Record<number, string> = {
      1: 'Entrada',
      2: 'Salida',
      3: 'Ajuste',
    };
    return tiposMovimiento[idMovimiento] || 'Desconocido';
  }

  // Método para convertir idUsuario a usuario rol
  private obtenerNombreRolUsuario(idUsuario: number): string {
    const rolesUsuario: Record<number, string> = {
      1: 'Admin',
      2: 'Vendedor',
    };
    return rolesUsuario[idUsuario] || 'Desconocido';
  }

  // Método auxiliar para calcular el porcentaje de la barra
  calcularPorcentajeBarra(valor: number, max: number): number {
    if (max === 0) return 0;
    return (valor / max) * 100;
  }

  // Método para obtener el valor máximo de ventas de la semana (para escalar el gráfico)
  getMaxVentaSemana(): number {
    if (this.ventasSemana.length === 0) return 1;
    return Math.max(...this.ventasSemana.map((v) => v.total));
  }

  // Método para formatear la fecha (ejemplo: "Lun 10")
  formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dias[date.getDay()]} ${date.getDate()}`;
  }

  // Método para obtener clase CSS según tipo de movimiento
  getMovimientoClass(tipo: string): string {
    switch (tipo) {
      case 'Entrada':
        return 'movimiento-entrada';
      case 'Salida':
        return 'movimiento-salida';
      case 'Ajuste':
        return 'movimiento-ajuste';
      default:
        return '';
    }
  }
}
