import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void {
    this._add('success', message);
  }

  error(message: string): void {
    this._add('error', message);
  }

  info(message: string): void {
    this._add('info', message);
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private _add(type: ToastType, message: string): void {
    const id = crypto.randomUUID();
    this._toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
