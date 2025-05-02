import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../services/usuario.service'; // Importar UsuarioService
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // Importar AuthService para obtener el token

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [RouterModule, RouterLinkActive, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuario: any = {}; // Inicializar usuario correctamente

  constructor(
    public logoutService: LogoutService,
    public router: Router,
    private usuarioService: UsuarioService, 
    private authService: AuthService // Inyectar AuthService para obtener el token correctamente
  ) {}

  ngOnInit(): void {
    const idUsuario = this.obtenerIdUsuarioDesdeToken();
    console.log("ID del usuario obtenido:", idUsuario); // Verificar que el ID es correcto

    if (idUsuario) {
      this.usuarioService.obtenerPerfilUsuario(idUsuario).subscribe({
        next: (data) => {
          console.log("Datos del perfil obtenidos:", data); // Verificar qué datos llegan del backend
          this.usuario = data;
        },
        error: (err) => {
          console.error("Error al obtener el perfil:", err);
        }
      });
    } else {
      console.error("No se pudo obtener el ID del usuario desde el token.");
    }
  }

  obtenerIdUsuarioDesdeToken(): number | null {
    const token = this.authService.obtenerToken(); // Usar el nuevo método para obtener el token correctamente
    if (!token || !token.includes(".")) {
      console.error("Error: El token obtenido no es válido.");
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idUsuario || null; // Validar si el ID realmente existe en el token
    } catch (error) {
      console.error("Error al extraer ID del usuario:", error);
      return null;
    }
  }
}