import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TokenService } from '../../shared/Token/token-service.service';
import { throwError } from 'rxjs';
import {  API_ENDPOINTS } from '../../shared/Api/api.constants';
import { ApiConstantsService } from '../../shared/Api/api-constants.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private tokenService: TokenService,private ConfigService: ApiConstantsService) { }

  login(userName: string, password: string): Observable<any> {
    const body = {
      userName,
      password,
      grantType: 'password'
    };

    return this.http.post<any>(`${this.ConfigService.apiBaseUrl}${API_ENDPOINTS.LOGIN}`, body).pipe(
      map(response => {
        if (response?.token) {
          this.tokenService.setToken(response.token);
          this.tokenService.setRole(response.roleName); // fallback
          return response;
        } else {
          throw new Error('Invalid response from server');
        }
      }),
      catchError(err => {
        const message = err.error?.message || 'Invalid credentials or server error';
        return throwError(() => new Error(message));
      })
    );
  }

  logout() {
    this.tokenService.clearToken();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getRole(): string | null {
    return this.tokenService.getRole();
  }
  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }
}
