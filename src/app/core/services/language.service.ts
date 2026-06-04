import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'en' | 'es';
const STORAGE_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<AppLang>('es');

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY) as AppLang | null;
    const browser = navigator.language.startsWith('en') ? 'en' : 'es';
    const lang: AppLang = saved ?? browser;
    this.setLanguage(lang);
  }

  setLanguage(lang: AppLang): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}
