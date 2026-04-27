import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly authBaseUrl = `${environment.baseUrl}/auth`;

  constructor(
    private readonly http: HttpClient
  ) {}

  login(payload: LoginPayload): Observable<boolean> {
    return this.loginWithApi(payload).pipe(map((response) => Boolean((response as { token?: string })?.token)));
  }

  loginWithApi(payload: LoginPayload): Observable<unknown> {
    return this.http.post<{ token?: string }>(`${this.authBaseUrl}/login`, payload).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  register(payload: { fullName: string; email: string; password: string }): Observable<unknown> {
    return this.http.post<{ token?: string }>(`${this.authBaseUrl}/register`, payload).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
