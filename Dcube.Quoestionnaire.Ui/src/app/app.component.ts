import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from './layout/admin-header/admin-header.component';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from './auth/services/auth.service';
import { FooterComponent } from "./layout/footer/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, NgIf, FooterComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'qst';
  auth = inject(AuthService);
}
