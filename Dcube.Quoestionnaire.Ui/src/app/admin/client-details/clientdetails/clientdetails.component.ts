import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../shared/Api/api-service.service';
import { API_ENDPOINTS } from '../../../shared/Api/api.constants';
import { SecurityreportComponent } from "../../../user/securityreport/securityreport.component";

@Component({
  selector: 'app-clientdetails',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, SecurityreportComponent],
  templateUrl: './clientdetails.component.html',
  styleUrl: './clientdetails.component.scss'
})
export class ClientdetailsComponent implements OnInit {
  private apiService = inject(ApiService);
  @Input() templateId!: number;
  @Input() clientId!: number;
  data: any = {};

  ngOnInit() {
    this.getClients();
  }

  getClients() {
    this.apiService.get<any>(API_ENDPOINTS.GET_CLIENTS + '/' + this.clientId ).subscribe({
      next: (data: any) => {
        this.data = data;
      },
      error: (err) => console.error('Failed to fetch clients:', err)
    });
  }

}