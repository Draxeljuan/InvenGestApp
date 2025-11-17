import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

import { LoginComponent } from './login/login.component'; 
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ReportesComponent } from './reportes/reportes.component';
import { VentasComponent } from './ventas/ventas.component';
import { AlertasComponent } from './alertas/alertas.component';
import { InventarioComponent } from './inventario/inventario.component';
import { PerfilComponent } from './perfil/perfil.component';
import { HistorialVentasComponent } from './historial-ventas/historial-ventas.component';
import { MovimientosInventarioComponent } from './movimientos-inventario/movimientos-inventario.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BackupsComponent } from './backups/backups.component';


export const routes: Routes = [
    { path: 'login', component: LoginComponent}, // Ruta pública
    
    // Rutas protegidas con `authGuard`
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] }, 
    { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] }, 
    { path: 'ventas', component: VentasComponent, canActivate: [authGuard] }, 
    { path: 'alertas', component: AlertasComponent, canActivate: [authGuard] }, 
    { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] }, 
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] }, 
    { path: 'historial-ventas', component: HistorialVentasComponent, canActivate: [authGuard] }, 
    { path: 'movimientos-inventario', component: MovimientosInventarioComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'backups', component: BackupsComponent},

    // Redirección por defecto al login si no se encuentra la ruta
    { path: '', redirectTo: '/login', pathMatch: 'full'},  
];
