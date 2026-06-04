import { Component, OnInit, inject } from '@angular/core';
import { AppShellComponent } from '@shared/components/app-shell/app-shell.component';
import { ToastContainerComponent } from '@shared/components/toast-container/toast-container.component';
import { LanguageService } from '@core/services/language.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent, ToastContainerComponent],
  template: `
    <app-shell />
    <app-toast-container />
  `,
})
export class AppComponent implements OnInit {
  private readonly lang = inject(LanguageService);
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.init();
    this.lang.init();
  }
}
