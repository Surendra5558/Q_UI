import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/Api/api-service.service';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';

@Component({
  selector: 'app-securityreport',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './securityreport.component.html',
  styleUrl: './securityreport.component.scss'
})
export class SecurityreportComponent {

  reportData: any = null;
  percntages: number[] = [];
  id!: number;
  templateId!: number;
  clientId!: number;

constructor(private apiService: ApiService, private route: ActivatedRoute) {
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
      this.apiService.get<[]>(`${API_ENDPOINTS.GET_SUMMARY}/${this.id}`).subscribe({
        next: (data: any) => {
          // Transform date fields here to only keep the date part (YYYY-MM-DD)
          console.log('Fetched summary:', data);

          var dataToPush = {
            score: Number(data?.score) || 0,
            headers: [] as any[],
            totals: [] as any[],
            percentages: [] as any[],
            indicators: [] as any[],
            rows: [] as any[],
          };

          data.resilienceSummaries.forEach((item: any) => {
            dataToPush.headers.push(item.sectionName);
            dataToPush.totals.push(item.score);
            dataToPush.percentages.push(item.percentage + '%');
            this.percntages.push(item.percentage);
            dataToPush.indicators.push(item.score);

            item.responseTypeCounts.forEach((response: any) => {
              const existingRow = dataToPush.rows.find((r: any) => r.label === response.name);
              if (existingRow) {
                existingRow.values.push(response.count);
                // handle exiexistingRowsting row logic here
              } else {
                dataToPush.rows.push({
                  label: response.name,
                  values: [response.count]
                });
              }
            });
          });
          this.reportData = dataToPush;
          console.log('Processed report data:', this.reportData);
        },
        error: (err) => console.error('Failed to fetch clients:', err)
      });
    }

    getRowTotal(row: any): number {
      return Array.isArray(row.values) ? row.values.reduce((acc: number, val: number) => acc + val, 0) : 0;
    }

    getTotalsSum(): number {
      return Array.isArray(this.reportData?.totals) ? this.reportData.totals.reduce((a: number, b: number) => a + b, 0) : 0;
    }

    getTotalPercentage(): number {
      return Array.isArray(this.percntages) ? this.reportData.totals.reduce((a: number, b: number) => a + b, 0) : 0;
    }
  }
