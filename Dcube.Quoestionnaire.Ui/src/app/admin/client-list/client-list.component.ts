import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgFor, CommonModule } from '@angular/common';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';
import { ApiService } from '../../shared/Api/api-service.service';


 interface Client {
  address: string | null;
  contactPerson: string | null;
  contactPersonEmail: string | null;
  contactPersonPhone: string | null;
  createdBy: string;
  createdOn: string; // or `Date` if you're converting to Date objects
  id: number;
  legalName: string | null;
  modifiedBy: string;
  modifiedOn: string; // or `Date`
  name: string;
  numberOfEmployees: number;
  numberOfExternalPartners: number;
  numberOfLocations: number;
  numberOfSuppliers: number;
  phoneNumber: string | null;
  statusId: number;
  statusName: string;
  templateId: number;
  templateName: string;
}
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatDialogModule, NgFor,
    CommonModule, MatFormFieldModule, MatInputModule,
    MatSortModule, MatPaginatorModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);
cols = [
  { key: 'name', label: 'Name' },
  { key: 'numberOfEmployees', label: 'Employees' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdOn', label: 'Created On' },
  { key: 'modifiedBy', label: 'Modified By' },
  { key: 'modifiedOn', label: 'Modified On' },
  { key: 'templateName', label: 'Template Name' },
  { key: 'actions', label: 'Actions' }
];

colsToDisplay = this.cols.map(c => c.key);
  dataSource = new MatTableDataSource<Client>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getClients();
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

 getClients() {
  this.apiService.get<Client[]>(API_ENDPOINTS.GET_CLIENTS).subscribe({
    next: (data: any) => {
      // Transform date fields here to only keep the date part (YYYY-MM-DD)
      const transformed = data.value.map((client: Client) => ({
        ...client,
        createdOn: client.createdOn ? client.createdOn.split('T')[0] : null,
        modifiedOn: client.modifiedOn ? client.modifiedOn.split('T')[0] : null,
      }));
      this.dataSource.data = transformed;
    },
    error: (err) => console.error('Failed to fetch clients:', err)
  });
}

  openModal(client?: Client) {
    const dialogRef = this.dialog.open(ClientModalComponent, {
      width: '600px',
      data: client ? { ...client } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // implement updateClient() using apiService.put
        } else {
          // implement createClient() using apiService.post
        }
        this.getClients(); // Refresh list
      }
    });
  }
}
