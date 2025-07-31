import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgFor, CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../shared/Api/api-service.service';
import { Client, ClientTemplate } from '../../Interfaces/admin-interface';
import { API_ENDPOINTS } from '../../../shared/Api/api.constants';
import { TokenService } from '../../../shared/Token/token-service.service'; // <-- import your TokenService
import { ClientTemplateModalComponent } from '../../client-template-modal/client-template-modal.component';

@Component({
  selector: 'app-client-template-list',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatDialogModule, NgFor, CommonModule,
    MatFormFieldModule, MatInputModule, MatSortModule, MatPaginatorModule, RouterModule
  ],
  templateUrl: './client-template-list.component.html',
  styleUrl: './client-template-list.component.scss'
})
export class ClientTemplateListComponent implements AfterViewInit, OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private tokenService = inject(TokenService); // <-- inject token service

  cols = [
    { key: 'clientName', label: 'Client Name' },
    { key: 'templateName', label: 'Template Name' },
    { key: 'statusName', label: 'Status Name' },
    { key: 'percentageCompleted', label: 'Percentage Completed' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdOn', label: 'Created On' },
    { key: 'modifiedBy', label: 'Modified By' },
    { key: 'modifiedOn', label: 'Modified On' },
  ];

  colsToDisplay = this.cols.map(c => c.key);
  dataSource = new MatTableDataSource<ClientTemplate>([]);

  showNoTemplateMessage = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getClientTemplates();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getClientTemplates() {
    this.apiService.get<ClientTemplate[]>(API_ENDPOINTS.GET_CLIENTTEMPLATE).subscribe({
      next: (data: any) => {
        const transformed = data.value.map((clientTemplate: ClientTemplate) => ({
          ...clientTemplate,
          createdOn: clientTemplate.createdOn ? clientTemplate.createdOn.split('T')[0] : null,
          modifiedOn: clientTemplate.modifiedOn ? clientTemplate.modifiedOn.split('T')[0] : null,
        }));
        const role = this.tokenService.getRole();
        if (transformed.length === 0  && role !== '1') {
          this.showNoTemplateMessage = true;
          this.dataSource.data = [];
          return;
        }
        this.dataSource.data = transformed;        
        if (transformed.length > 0 && role !== '1') {
        const { templateId, clientId, id } = transformed[0];
        this.router.navigate([
          `/user/questionnaireSummary`
        ], {
          queryParams: {
            templateId,
            clientId,
            id
          }
        });
      }
      },
      error: (err) => console.error('Failed to fetch client templates:', err)
    });
  }

  getQuestionnaireLink() {
    // Assuming admin role is '1'
    const role = this.tokenService.getRole();
    if (role === '1') {
      return ['/admin/questionnaireSummary'];
    }
    return ['/user/questionnaireSummary'];
  }

  isAdmin() {
    const role = this.tokenService.getRole();
    return role === '1'; // Assuming '1' is the admin role
  }

  openModal(client?: Client) {
    const dialogRef = this.dialog.open(ClientTemplateModalComponent, {
      width: '600px',
      data: client ? { ...client } : {}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result) {
        if (result.id) {
          // implement updateClient() using apiService.put
        } else {
          // implement createClient() using apiService.post
        }
        this.getClientTemplates(); // Refresh list
      }
    });
  }
}