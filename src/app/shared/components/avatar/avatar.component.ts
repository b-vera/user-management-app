import { Component, computed, input } from '@angular/core';
import { avatarColor } from '@shared/utils/avatar-color.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="relative inline-flex shrink-0" [style.width.px]="size()" [style.height.px]="size()">
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="name()" class="rounded-full object-cover w-full h-full" />
      } @else {
        <div
          class="rounded-full flex items-center justify-center text-white font-semibold w-full h-full select-none"
          [style.background]="bgColor()"
          [style.fontSize.px]="fontSize()"
        >
          {{ initials() }}
        </div>
      }
      @if (showDot()) {
        <span [class]="dotClass()"></span>
      }
    </div>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly imageUrl = input<string>('');
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

  readonly bgColor = computed(() => avatarColor(this.name()));

  readonly fontSize = computed(() => Math.round(this.size() * 0.36));

  readonly dotClass = computed(() => {
    const s = this.size();
    const sz = s <= 32 ? 'w-2.5 h-2.5' : s <= 48 ? 'w-3 h-3' : 'w-3.5 h-3.5';
    const color = this.active() ? 'bg-green-400' : 'bg-neutral-400';
    return `absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-dark-surface ${sz} ${color}`;
  });
}
