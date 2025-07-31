import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TokenService } from '../../shared/Token/token-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink,MatIconModule,RouterModule,CommonModule,FormsModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent {
 userRole: 'admin' | 'user' = 'user';
 private auth = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  get isAdmin(): boolean {
    return this.tokenService.getRole() === '1';
  }

  get isUser(): boolean {
    // assuming "user" is any role not '1'
    return !!this.tokenService.getToken() && this.tokenService.getRole() !== '1';
  }

  get isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  logout() {
    this.tokenService.clearToken();
    window.location.href = '';
  }

  constructor() {
    // Clear token on browser/tab close
    window.addEventListener('unload', () => {
      //this.tokenService.clearToken();
    });
  }
}
