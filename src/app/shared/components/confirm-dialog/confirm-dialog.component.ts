import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [A11yModule],
  template: `
    <div
      role="alertdialog"
      [attr.aria-labelledby]="'dialog-title'"
      [attr.aria-describedby]="'dialog-desc'"
      tabindex="-1"
      class="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 outline-none"
    >
      <h2
        id="dialog-title"
        class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
      >
        {{ data.title }}
      </h2>
      <p id="dialog-desc" class="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
        {{ data.message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          #cancelBtn
          cdkFocusInitial
          (click)="close(false)"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600
                 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
        >
          {{ data.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          (click)="close(true)"
          [class]="confirmClass"
          class="px-4 py-2 text-sm font-medium text-white rounded-lg
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);

  get confirmClass(): string {
    return this.data.danger
      ? 'bg-crimson-600 hover:bg-crimson-800 focus-visible:ring-crimson-600'
      : 'bg-brand-indigo hover:bg-indigo-900 focus-visible:ring-brand-indigo';
  }

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
