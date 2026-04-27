import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-shared-shell-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Cashew ERP</p>
          <h1>{{ title }}</h1>
          <p>{{ subtitle }}</p>
        </div>
      </header>

      <mat-card class="page-card">
        <div class="page-card__icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>
      </mat-card>
    </section>
  `,
  styles: [`
    .page-shell {
      display: grid;
      gap: 20px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.9rem;
      color: #223a66;
    }

    .page-header p:last-child {
      margin: 8px 0 0;
      color: #6f82a6;
    }

    .eyebrow {
      margin: 0 0 6px;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5e7ac0;
    }

    .page-card {
      padding: 28px;
      display: flex;
      align-items: center;
      gap: 18px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(30, 56, 108, 0.06);
    }

    .page-card__icon {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      color: #2f5cc6;
      background: #eef3ff;
    }

    .page-card__icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .page-card h2 {
      margin: 0 0 6px;
      color: #233a67;
    }

    .page-card p {
      margin: 0;
      color: #7184a8;
      line-height: 1.5;
    }
  `]
})
export class SharedShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() description = '';
  @Input() icon = 'dashboard';
}
