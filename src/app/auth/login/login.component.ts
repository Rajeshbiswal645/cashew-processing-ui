import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  isSubmitting = false;
  authError = '';
  hidePassword = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authError = '';

    this.authService
      .login({
        email: this.emailControl?.value ?? '',
        password: this.passwordControl?.value ?? '',
        rememberMe: this.loginForm.get('rememberMe')?.value ?? false
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (isAuthenticated) => {
          if (!isAuthenticated) {
            this.authError = 'Invalid credentials';
            this.snackBar.open('Invalid credentials', 'Close', { duration: 2600 });
            return;
          }

          const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          this.snackBar.open('Login successful', 'Close', { duration: 2200 });
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.authError = 'Invalid credentials';
          this.snackBar.open('Invalid credentials', 'Close', { duration: 2600 });
        }
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
