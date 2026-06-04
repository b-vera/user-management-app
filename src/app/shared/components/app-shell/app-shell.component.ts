import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, AppLang } from '@core/services/language.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-dark-bg flex">
      <!-- Sidebar overlay (mobile) -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-20 bg-black/50 md:hidden"
          (click)="sidebarOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <!-- Sidebar -->
      <aside [class]="sidebarClass()" aria-label="Navegación principal">
        <!-- Brand -->
        <div
          class="flex items-center justify-center xl:justify-start gap-3 px-3 xl:px-6 py-5 border-b border-white/10"
        >
          <div
            class="w-8 h-8 rounded-lg bg-brand-crimson flex items-center justify-center shrink-0"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span
            class="text-white font-semibold text-sm leading-tight hidden xl:inline"
            [innerHTML]="'app.title' | translate"
          ></span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1" aria-label="Secciones">
          <a
            routerLink="/users"
            routerLinkActive="bg-white/10 border-l-2 border-brand-crimson"
            #usersLink="routerLinkActive"
            [attr.aria-current]="usersLink.isActive ? 'page' : null"
            class="flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-white/80
                   hover:bg-white/10 hover:text-white transition-colors text-sm font-medium
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            [title]="'nav.users' | translate"
            (click)="sidebarOpen.set(false)"
          >
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span class="hidden xl:inline">{{ 'nav.users' | translate }}</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="px-3 xl:px-6 py-4 border-t border-white/10">
          <p class="text-white/40 text-xs hidden xl:block">v1.0.0</p>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col md:ml-16 xl:ml-60">
        <!-- Topbar -->
        <header
          class="sticky top-0 z-10 h-16 bg-white dark:bg-dark-surface border-b
                       border-neutral-200 dark:border-dark-border flex items-center px-4 gap-4"
        >
          <!-- Hamburger (mobile) -->
          <button
            class="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            (click)="sidebarOpen.set(!sidebarOpen())"
            [attr.aria-expanded]="sidebarOpen()"
            aria-label="Abrir menú de navegación"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <span class="flex-1"></span>

          <!-- Language toggle -->
          <button
            (click)="toggleLang()"
            class="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200
                   dark:border-neutral-700 text-neutral-600 dark:text-neutral-300
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            [attr.aria-label]="'lang.toggle' | translate"
          >
            {{ langService.currentLang() === 'es' ? 'EN' : 'ES' }}
          </button>

          <!-- Dark mode toggle -->
          <button
            (click)="themeService.toggle()"
            class="p-2 rounded-lg text-neutral-600 dark:text-neutral-300
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            [attr.aria-label]="
              themeService.isDark() ? ('theme.light' | translate) : ('theme.dark' | translate)
            "
          >
            @if (themeService.isDark()) {
              <!-- Sun icon -->
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            } @else {
              <!-- Moon icon -->
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            }
          </button>
        </header>

        <!-- Page content -->
        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  readonly langService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  readonly sidebarOpen = signal(false);

  sidebarClass(): string {
    const base =
      'fixed top-0 left-0 h-full w-60 md:w-16 xl:w-60 z-30 flex flex-col transition-transform duration-300 ease-in-out bg-brand-indigo dark:bg-dark-surface';
    const position = this.sidebarOpen() ? 'translate-x-0' : '-translate-x-full md:translate-x-0';
    return `${base} ${position}`;
  }

  toggleLang(): void {
    const next: AppLang = this.langService.currentLang() === 'es' ? 'en' : 'es';
    this.langService.setLanguage(next);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.sidebarOpen.set(false);
  }
}
