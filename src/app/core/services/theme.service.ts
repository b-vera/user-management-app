import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'app_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved !== null ? saved === 'dark' : prefersDark;
    this._apply(dark);
  }

  toggle(): void {
    this._apply(!this.isDark());
  }

  private _apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
    this.isDark.set(dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
