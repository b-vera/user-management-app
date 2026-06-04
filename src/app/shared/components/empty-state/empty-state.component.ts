import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <svg
        class="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>

      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        {{ title }}
      </h3>

      @if (description) {
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
          {{ description }}
        </p>
      }

      @if (actionLabel) {
        <button
          (click)="action.emit()"
          class="px-4 py-2 text-sm font-medium text-white bg-brand-indigo rounded-lg
                 hover:bg-indigo-900 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Sin resultados';
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
