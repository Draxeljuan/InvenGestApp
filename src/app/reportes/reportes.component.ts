import { Component } from '@angular/core';
import { LogoutService } from '../logout.service';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-reportes',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {
  constructor(
    public logoutService: LogoutService,
    public router: Router
  ){}
}
