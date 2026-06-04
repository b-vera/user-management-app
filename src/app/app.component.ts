import { Component } from '@angular/core';
import { AppShellComponent } from '@shared/components/app-shell/app-shell.component';
import { ToastContainerComponent } from '@shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent, ToastContainerComponent],
  template: `
    <app-shell />
    <app-toast-container />
  `,
})
export class AppComponent {}
