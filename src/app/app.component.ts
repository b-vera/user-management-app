import { Component, OnInit, inject } from '@angular/core';
import { AppShellComponent } from '@shared/components/app-shell/app-shell.component';
import { ToastContainerComponent } from '@shared/components/toast-container/toast-container.component';
import { LanguageService } from '@core/services/language.service';

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

  ngOnInit(): void {
    this.lang.init();
  }
}
