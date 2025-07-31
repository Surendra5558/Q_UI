import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../shared/Api/api-service.service';
import { Client } from '../Interfaces/admin-interface';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatOptionModule
  ],
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.scss']
})
export class ClientModalComponent {
  errorMessage = '';
  templateNames: string[] = ['Template A', 'Template B', 'Template C'];
  statusNames: string[] = ['Active', 'Inactive', 'Pending'];
  constructor(
    public dialogRef: MatDialogRef<ClientModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client,
    private apiService: ApiService
  ) { }

  onSave() {
    this.errorMessage = '';

    if (this.data.id) {
      this.apiService.put<Client>(`/clients/${this.data.id}`, this.data).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.errorMessage = err.message || 'Failed to update client'
      });
    } else {
      this.apiService.post<Client>(`/clients`, this.data).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.errorMessage = err.message || 'Failed to create client'
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
