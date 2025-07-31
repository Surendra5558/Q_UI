import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/Api/api-service.service';
import {  API_ENDPOINTS } from '../../shared/Api/api.constants';

@Component({
  selector: 'app-pathwaymaturity',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './pathwaymaturity.component.html',
  styleUrl: './pathwaymaturity.component.scss'
})
export class PathwaymaturityComponent implements OnInit {
  pathwayForm: FormGroup;
  reportHeaders: string[] = [];
  reportHeaderIds: number[] = [];
  reportPercentages: string[] = [];
  id!: number;
  templateId!: number;
  clientId!: number;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {
    this.pathwayForm = this.fb.group({});
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.id = Number(params.get('id'));
      this.templateId = Number(params.get('templateId'));
      this.clientId = Number(params.get('clientId'));
    });
    this.getSummary();
  }

getSummary() {
  this.apiService.get<getSummaryModel[]>(`/v1/ClientTemplateSectionSolution/${this.templateId}`).subscribe({
    next: (data) => {
      console.log('Fetched section solutions:', data);

      this.reportHeaders = [];
      this.reportPercentages = [];
      this.reportHeaderIds = [];

      data.forEach((item: getSummaryModel) => {
        this.reportHeaders.push(item.templateSectionName);
        this.reportPercentages.push(item.percentage + '%');
        this.reportHeaderIds.push(item.id); 
      });

      this.buildFormControls();
    },
    error: (err) => console.error('Failed to fetch section solutions:', err)
  });
}



  buildFormControls() {
    const formControls: { [key: string]: any } = {};
    this.reportHeaders.forEach((header, index) => {
      formControls[`identityGaps_${index}`] = [''];
      formControls[`remediationPoints_${index}`] = [''];
    });
    
    this.pathwayForm = this.fb.group(formControls);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Selected file:', file.name);    
      alert(`File "${file.name}" selected successfully!`); 
      this.uploadFile(file); 
    }
  }

  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', this.id.toString());
    formData.append('templateId', this.templateId.toString());
    formData.append('clientId', this.clientId.toString());

    this.http.post('/api/pathway-report/upload', formData).subscribe({
      next: (response) => {
        console.log('File uploaded successfully:', response);
        alert('File uploaded successfully!');
      },
      error: (error) => {
        console.error('File upload failed:', error);
        alert('File upload failed. Please try again.');
      }
    });
  }

onSave(): void {
  if (this.pathwayForm.valid) {
    const payload: onSaveModel[] = [];

    this.reportHeaders.forEach((header, index) => {
      payload.push({
        id: this.reportHeaderIds[index],
        variance: this.pathwayForm.get(`identityGaps_${index}`)?.value || '',
        resolution: this.pathwayForm.get(`remediationPoints_${index}`)?.value || ''
      });
    });

    this.apiService.post(`/v1/ClientTemplateSectionSolution`, payload).subscribe({
      next: () => {
        alert('Saved successfully!');
        this.pathwayForm.reset();
      },
      error: () => {
        alert('Failed to save.');
      }
    });
  }
}


  onReset(): void {
    this.pathwayForm.reset();
    this.selectedFile = null;
  }
}
 interface getSummaryModel{
      id : number;
      CreatedOn: string;
      ModifiedOn: string;
      CreatedBy: string;
      ModifiedBy: string;
      TemplateSectionId : number;
      Score: number;
      percentage: number;
      templateSectionName: string;
      Variance: string;
      Resolution: string;
}

interface onSaveModel {
  id: number;
  variance: string;
  resolution: string;
}

