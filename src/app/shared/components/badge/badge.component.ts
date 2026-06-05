import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'admin' | 'user' | 'guest' | 'active' | 'inactive';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="wrapClass()">
      <span [class]="dotClass()"></span>
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input.required<BadgeVariant>();

  readonly wrapClass = computed(() => {
    const base =
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border';
    const map: Record<BadgeVariant, string> = {
      admin:
        'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/40',
      user: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40',
      guest:
        'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-500/20 dark:text-neutral-300 dark:border-neutral-500/40',
      active:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/40',
      inactive:
        'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-600',
    };
    return `${base} ${map[this.variant()]}`;
  });

  readonly dotClass = computed(() => {
    const map: Record<BadgeVariant, string> = {
      admin: 'w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400',
      user: 'w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400',
      guest: 'w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500',
      active: 'w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400',
      inactive: 'w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500',
    };
    return map[this.variant()];
  });
}
