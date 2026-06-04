import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { AppError } from '@core/models/user.model';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url}`,
    setHeaders: {
      Authorization: 'Bearer demo-token',
    },
  });

  return next(apiReq).pipe(catchError((err) => throwError(() => mapToAppError(err))));
};

function mapToAppError(err: unknown): AppError {
  const timestamp = new Date().toISOString();

  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return { status: 0, message: 'error.network', timestamp };
    }
    if (err.status >= 400 && err.status < 500) {
      const message = err.status === 404 ? 'error.notFound' : 'error.client';
      return { status: err.status, message, timestamp };
    }
    return { status: err.status, message: 'error.server', timestamp };
  }

  return { status: -1, message: 'error.unknown', timestamp };
}
