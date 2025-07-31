import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../../shared/Token/token-service.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf,CommonModule,MatDialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';

  private auth = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  hidePassword = true;
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {
   this.tokenService.clearToken();
  }
  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRole(response.roleId); // assuming API sends role
        const path = response.roleId  == 1 ?   '/admin/clients' : '/user/clientTemplates';
        this.router.navigate([path]);
        
      },
      error: (err) => {
        this.error = err.message || 'Login failed. Please check credentials.';
      }
    });
  }

  forgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '400px'
    });

    dialogRef.componentInstance.close.subscribe(() => dialogRef.close());
  }
}
