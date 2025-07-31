import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiConstantsService {

  private config: any;
  private configLoaded = false;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    if (!this.configLoaded) {
      this.config = await firstValueFrom(
        this.http.get('/assets/api-constants.json')
      );
      this.configLoaded = true;
    }
  }

  get apiBaseUrl(): string {
    return this.config?.API_BASE_URL || '';
  }
}
