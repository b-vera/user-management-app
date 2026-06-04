import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div aria-busy="true" aria-label="Cargando..." role="status" class="w-full">
      <!-- Header skeleton -->
      <div
        class="h-10 bg-neutral-200 dark:bg-dark-surface rounded-lg mb-4 animate-pulse w-48"
      ></div>

      <!-- Table header skeleton -->
      <div class="flex gap-4 mb-3 px-4">
        @for (col of cols; track col) {
          <div
            class="h-4 bg-neutral-200 dark:bg-dark-surface rounded animate-pulse"
            [style.width]="col"
          ></div>
        }
      </div>

      <!-- Row skeletons -->
      @for (row of rowsArray; track row) {
        <div
          class="flex items-center gap-4 px-4 py-3 mb-2 rounded-lg
                 bg-neutral-100 dark:bg-dark-surface animate-pulse"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0"></div>
          <!-- Username -->
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
          <!-- Email -->
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-48 hidden sm:block"></div>
          <!-- Role badge -->
          <div
            class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-16 hidden md:block"
          ></div>
          <!-- Status badge -->
          <div
            class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-16 hidden md:block"
          ></div>
          <!-- Actions -->
          <div class="ml-auto flex gap-2">
            <div class="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div class="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  readonly cols = ['10%', '15%', '25%', '10%', '10%'];
}
