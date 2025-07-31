import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgFor } from '@angular/common';
import { UserModalComponent } from '../user-modal/user-modal.component';
// import { User, UserService } from '../services/user.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../shared/Api/api-service.service';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';

interface Client {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatDialogModule, NgFor,
    CommonModule, MatFormFieldModule, MatInputModule, MatSortModule, MatPaginatorModule,
    FormsModule, MatSelectModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements AfterViewInit {
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);

  clients: Client[] = [];
  selectedClientId: string | null = null;

  
cols = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'clientName', label: 'Client Name' },
   { key: 'roleName', label: 'Role' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdOn', label: 'Created On' },
  { key: 'modifiedBy', label: 'Modified By' },
  { key: 'modifiedOn', label: 'Modified On' },
  { key: 'actions', label: 'Actions' }
];
colsToDisplay = this.cols.map(c => c.key);
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnInit() {
    this.getClients();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onClientChange(clientId: string | null) {
    this.selectedClientId = clientId;
    if (clientId) {
      this.getUsers(clientId); // Pass the selected clientId here
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    } else {
      this.dataSource.data = [];
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModal(user?: any) {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '600px',
      data: user ? { ...user } : {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // this.userService.updateUser(result);
        } else {
          // this.userService.createUser(result);
        }
        // this.allUsers = this.userService.getUsers();
        this.onClientChange(this.selectedClientId);
      }
    });
  }


  getClients() {
    this.apiService.get<Client[]>(API_ENDPOINTS.GET_CLIENTS).subscribe({
      next: (data: any) => {
        this.clients = data.value.map((client: Client) => ({
          id: client.id,
          name: client.name
        }));
        this.clients.unshift({ id: '-1', name: 'All Clients' }); // Add "All Clients" option
      },
      error: (err: any) => console.error('Failed to fetch clients:', err)
    });
  }

  getUsers(clientId: string | null = this.selectedClientId) {
    // Pass clientId as a query param if your API supports filtering by client
    let endpoint = API_ENDPOINTS.GET_USERS;
    if (clientId) {
      endpoint += (clientId !== '-1') ?`?$filter=clientId eq ${clientId}` : '';
    }
 
    this.apiService.get<any[]>(endpoint).subscribe({
      next: (data: any) => {
        this.dataSource.data = data.value.map((user: any) => ({
          ...user,
          createdOn: user.createdOn ? user.createdOn.split('T')[0] : null,
          modifiedOn: user.modifiedOn ? user.modifiedOn.split('T')[0] : null,
        }));
      },
      error: (err: any) => console.error('Failed to fetch users:', err)
    });
  }
}