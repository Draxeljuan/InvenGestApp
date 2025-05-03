import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Obtener token y rol del almacenamiento local
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

  if (!token || !role) {
    console.warn("No hay token o rol disponible, redirigiendo al login...");
    router.navigate(['/login']); // Redirigir al login si no hay token o rol
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;

    if (Date.now() >= exp) {
      console.warn("Token expirado, eliminando y redirigiendo al login...");
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userRole');
      router.navigate(['/login']);
      return false;
    }

    // Restringir acceso a "inventario" solo a administradores
    if (route.routeConfig?.path === 'inventario' && role !== 'ROLE_ADMINISTRADOR') {
      console.warn("Acceso denegado: Solo administradores pueden ingresar a Inventario.");
      alert('⚠️ No tienes autorización para acceder a Inventario.');
      router.navigate(['/admin-dashboard']); // 🔄 Redirigir a otra página permitida
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al procesar el token:", error);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    router.navigate(['/login']);
    return false;
  }
};