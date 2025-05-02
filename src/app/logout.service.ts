import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private showModal = new BehaviorSubject<boolean>(false);
  modalState$ = this.showModal.asObservable();

  constructor(private authService: AuthService) { } // Inyecta AuthService

  openModal(): void {
    this.showModal.next(true); // Muestra el Modal
  }

  confirmLogout(): void {
    try {
      this.authService.cerrarSesion(); // Elimina el token y redirige al login
      this.showModal.next(false); // Cierra el Modal
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  closeModal(): void {
    this.showModal.next(false); // Oculta el Modal
  }
}