import { Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { avatarColors } from '@shared/utils/avatar-color.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <span
      class="relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight select-none"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.fontSize.px]="fontSize()"
      [style.background]="colors().bg"
      [style.color]="colors().fg"
      [style.boxShadow]="ring()"
    >
      {{ initials() }}
      @if (showDot()) {
        <span
          class="absolute -bottom-0.5 -right-0.5 rounded-full"
          [style.width.px]="dotSize()"
          [style.height.px]="dotSize()"
          [style.background]="active() ? 'oklch(0.72 0.17 150)' : 'oklch(0.65 0.02 270)'"
          [style.boxShadow]="dotRing()"
        ></span>
      }
    </span>
  `,
})
export class AvatarComponent {
  private readonly theme = inject(ThemeService);

  readonly name = input.required<string>();
  readonly size = input<number>(32);
  readonly active = input<boolean>(true);
  readonly showDot = input<boolean>(false);

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  });

  readonly colors = computed(() => avatarColors(this.name(), this.theme.isDark()));

  readonly fontSize = computed(() => Math.round(this.size() * 0.38));

  readonly dotSize = computed(() => Math.max(9, Math.round(this.size() * 0.26)));

  readonly ring = computed(
    () => `0 0 0 1.5px ${this.colors().ring}, 0 1px 2px rgba(16, 16, 32, 0.10)`,
  );

  readonly dotRing = computed(
    () => `0 0 0 2px ${this.theme.isDark() ? 'var(--surface)' : '#ffffff'}`,
  );
}
