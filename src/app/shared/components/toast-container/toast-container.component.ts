import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService, Toast } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div
      aria-live="polite"
      aria-atomic="false"
      class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
          class="flex items-start gap-3 rounded-lg pl-0 pr-4 py-3 shadow-lg shadow-black/10 text-sm
                 bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border
                 overflow-hidden"
          [class]="toastClass(toast)"
        >
          <!-- Left color strip -->
          <span class="w-1 self-stretch shrink-0 rounded-l-lg" [class]="stripClass(toast)"></span>
          <!-- Icon -->
          <span [class]="iconClass(toast)" class="mt-0.5 shrink-0 font-bold">{{
            icon(toast)
          }}</span>
          <!-- Message -->
          <span class="flex-1 text-neutral-900 dark:text-neutral-100">{{
            toast.message | translate
          }}</span>
          <!-- Dismiss -->
          <button
            (click)="toastService.dismiss(toast.id)"
            class="ml-auto shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo rounded"
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

  toastClass(_toast: Toast): string {
    return '';
  }

  stripClass(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-green-500',
      error: 'bg-crimson-600',
      info: 'bg-brand-indigo',
    };
    return map[toast.type];
  }

  iconClass(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: 'text-green-500',
      error: 'text-crimson-600',
      info: 'text-brand-indigo',
    };
    return map[toast.type];
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
