import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import { AuthService } from '../../shared/services/auth.service';
import { SignupRequest } from '../../shared/models/signup-request';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: '../login/login.component.css'
})
export class SignupComponent {

  signupForm: FormGroup;

  loading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.signupForm = this.formBuilder.group(
      {
        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100)
          ]
        ],

        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.pattern(/^[a-zA-Z0-9._]+$/)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9][0-9]{9}$/)
          ]
        ],

        role: [
          'SALES_EXECUTIVE',
          Validators.required
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ]
      },
      {
        validators: this.passwordMatchValidator()
      }
    );
  }

  private passwordMatchValidator(): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const password =
        control.get('password')?.value;

      const confirmPassword =
        control.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible =
      !this.confirmPasswordVisible;
  }

  signup(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const formValue = this.signupForm.value;

    const request: SignupRequest = {
      fullName: formValue.fullName.trim(),
      username: formValue.username.trim(),
      email: formValue.email.trim(),
      mobile: formValue.mobile.trim(),
      password: formValue.password,
      role: formValue.role
    };

    this.loading = true;

    this.authService.signup(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: response => {
          if (!response.success) {
            this.errorMessage = response.message;
            return;
          }

          this.successMessage =
            'Account created successfully. Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);
        },

        error: error => {
          this.errorMessage =
            error.error?.message ??
            this.extractValidationError(error.error) ??
            'Unable to create account.';
        }
      });
  }

  private extractValidationError(
    errorBody: {
      validationErrors?: Record<string, string>;
    } | null
  ): string | null {

    if (!errorBody?.validationErrors) {
      return null;
    }

    const messages =
      Object.values(errorBody.validationErrors);

    return messages.length > 0
      ? messages[0]
      : null;
  }
}