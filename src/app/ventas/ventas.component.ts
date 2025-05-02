import { Component } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-ventas',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent {
  constructor(
    public logoutService: LogoutService,
    public router: Router
  ) {}
}
