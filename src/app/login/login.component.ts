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
        // Guardar el token en el almacenamiento local
        this.authService.guardarToken(response.token);
        // Redirigir a la página principal después de iniciar sesión
        this.router.navigate(['/admin-dashboard']);
      },
      error => {
        console.error('Error al iniciar sesión', error);
        alert('Error al iniciar sesión. Verifique sus credenciales.');
      }
    );
  }
}
