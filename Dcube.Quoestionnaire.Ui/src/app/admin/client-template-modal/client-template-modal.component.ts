import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';
import { ApiService } from '../../shared/Api/api-service.service';

interface Template {
  id: string;
  name: string;
  questions: string[];
}
interface Client {
  id: string;
  name: string;
}

@Component({
  selector: 'app-client-template-modal',
  standalone: true,
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, FormsModule, CommonModule
  ],
  templateUrl: './client-template-modal.component.html',
  styleUrl: './client-template-modal.component.scss'
})
export class ClientTemplateModalComponent implements OnInit {
  private apiService = inject(ApiService);
  selectedTemplateId: string | null = null;
  selectedClientId: string | null = null;
  clients: any;
  templates: any;

  constructor(
    public dialogRef: MatDialogRef<ClientTemplateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.getClients();
    this.getTempaltes();
  }

  onSave() {
    const payload = {  clientId : this.selectedClientId, templateId :this.selectedTemplateId };

    this.apiService.post(API_ENDPOINTS.POSTPUT_CLIENTTEMPLATE, payload).subscribe({
      next: (response) => {
       this.dialogRef.close(this.data);
      },
      error: (error) => {
        console.error('Failed to save ClientTemplate:', error);
      }
    });
 
  }
  onCancel() { this.dialogRef.close(); }

  onTemplateChange(templateId: string) {
    this.selectedTemplateId = templateId;
    this.data.templateId = templateId;
  }

  onClientChange(clientId: string) {
    this.selectedClientId = clientId;
    this.data.clientId = clientId;
  }

  getClients() {
    this.apiService.get<Client[]>(API_ENDPOINTS.GET_CLIENTS).subscribe({
      next: (data: any) => {
        this.clients = data?.value?.map((client: any) => ({
          id: client.id,
          name: client.name
        }));
      },
      error: (err) => console.error('Failed to fetch clients:', err)
    });
  }

  getTempaltes() {
    this.apiService.get<Client[]>(API_ENDPOINTS.GET_TEMPLATES).subscribe({
      next: (data: any) => {
        this.templates = data?.value?.map((template: any) => ({
          id: template.id,
          name: template.name
        }));
        if (this.templates.length > 0) {
          this.data.templateId = this.templates[0].id; // Set default template
        }
      },
      error: (err) => console.error('Failed to fetch clients:', err)
    });
  }
}