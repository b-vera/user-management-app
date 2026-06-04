import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      aria-live="polite"
      aria-atomic="false"
      class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
          [class]="toastClass(toast)"
          class="flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium"
        >
          <span class="mt-0.5 shrink-0 text-base">{{ icon(toast) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="ml-auto shrink-0 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            [attr.aria-label]="'Cerrar notificación'"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  toastClass(toast: Toast): string {
    const base = 'text-white';
    const colors: Record<Toast['type'], string> = {
      success: 'bg-green-600',
      error: 'bg-crimson-600',
      info: 'bg-brand-indigo',
    };
    return `${base} ${colors[toast.type]}`;
  }

  icon(toast: Toast): string {
    const icons: Record<Toast['type'], string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };
    return icons[toast.type];
  }
}
