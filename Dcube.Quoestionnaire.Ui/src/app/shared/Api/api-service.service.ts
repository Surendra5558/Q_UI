import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../Token/token-service.service';
import { ApiConstantsService } from './api-constants.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private tokenService: TokenService,private configservice: ApiConstantsService) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  get<T>(endpoint: string, options = {}): Observable<T> {
    return this.http.get<T>(`${this.configservice.apiBaseUrl}${endpoint}`, { headers: this.getHeaders(), ...options })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: any, options = {}): Observable<T> {
    return this.http.post<T>(`${this.configservice.apiBaseUrl}${endpoint}`, body, { headers: this.getHeaders(), ...options })
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: any, options = {}): Observable<T> {
    return this.http.put<T>(`${this.configservice.apiBaseUrl}${endpoint}`, body, { headers: this.getHeaders(), ...options })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options = {}): Observable<T> {
    return this.http.delete<T>(`${this.configservice.apiBaseUrl}${endpoint}`, { headers: this.getHeaders(), ...options })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.error?.message || 'Something went wrong!'));
  }
}
