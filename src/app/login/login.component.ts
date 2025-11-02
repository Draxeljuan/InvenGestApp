import { Component, importProvidersFrom } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  nombreUsuario: string = '';
  contrasena: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    this.authService.login(this.nombreUsuario, this.contrasena).subscribe(
      response => {
        this.authService.guardarToken(response.token);
        this.router.navigate(['/admin-dashboard']);
      },
      error => {
        console.error(" Error recibido en login component", error);

        if (error.status === 429) {
          const mensajeBloqueo = error.error?.message || "Demasiados intentos fallidos. Intente nuevamente más tarde.";
          alert(mensajeBloqueo);
          return;
        }

        if (error.message.includes("4081 (DB_TIMEOUT)")) {
          return; // No mostramos alertas de timeout aquí, ya se manejan en `auth.service.ts`
        }

        alert("⚠ Error al iniciar sesión. Verifique sus credenciales. Codigo error 404 UNAUTHORIZED");
      }
    );
  }

}
