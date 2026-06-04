import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly silent = environment.production;
  private readonly isDebug = environment.logLevel === 'debug';

  log(message: string, ...args: unknown[]): void {
    if (!this.silent) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDebug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
