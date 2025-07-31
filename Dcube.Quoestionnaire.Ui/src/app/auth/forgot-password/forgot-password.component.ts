import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
 email: string = '';
  error: string = '';
  success: string = '';

  @Output() close = new EventEmitter<void>();

  submit() {
    this.error = '';
    this.success = '';

    // Simulate API call
    if (!this.email.includes('@')) {
      this.error = 'Invalid email address.';
      return;
    }

    // Simulated API response
    setTimeout(() => {
      this.success = 'Password reset instructions sent to your email.';
    }, 1000);
  }
}
