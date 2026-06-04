import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <svg
        class="w-16 h-16 text-crimson-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>

      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        Algo salió mal
      </h3>

      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
        {{ message }}
      </p>

      <button
        (click)="retry.emit()"
        class="px-4 py-2 text-sm font-medium text-white bg-brand-indigo rounded-lg
               hover:bg-indigo-900 focus-visible:outline-none
               focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2"
      >
        Reintentar
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  @Input() message = 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
  @Output() retry = new EventEmitter<void>();
}
