import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LogoutService } from './logout.service';
import { AuthService } from './auth.service'; 

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'InvenGestApp';

  isLogoutModalVisible: boolean = false;

  constructor(
    private router: Router,
    public logoutService: LogoutService,
    private authService: AuthService // Inyectar AuthService
  ) {
    this.logoutService.modalState$.subscribe(state => {
      this.isLogoutModalVisible = state; // Actualiza el estado del Modal
    }); 
  }

  closeLogoutConfirmation(): void {
    this.logoutService.closeModal();
  }

  logout(): void {
    this.authService.cerrarSesion(); // Elimina el token y redirige al login
    this.logoutService.closeModal();
  }
}