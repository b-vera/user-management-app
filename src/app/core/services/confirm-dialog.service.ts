import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Observable, map } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open(data: ConfirmDialogData): Observable<boolean> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    return this.dialog
      .open<boolean>(ConfirmDialogComponent, {
        data,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-dark-backdrop',
        positionStrategy,
      })
      .closed.pipe(map((result) => !!result));
  }
}
