import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { PROJECTS_MOCK } from '../mocks/project.mock';
import { DEFAULT_DASHBOARD_MOCK } from '../mocks/dashboard.mock';

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isMock) {
      return next.handle(request);
    }

    switch (true) {
      case request.method === 'GET' && request.url.endsWith('api/projects'):
        return this.mockSuccessResponse(PROJECTS_MOCK);
      case request.method === 'GET' && request.url.endsWith('api/dashboard'):
        // eslint-disable-next-line no-case-declarations
        const dashboard = localStorage.getItem('dashboard');
        return dashboard
          ? this.mockSuccessResponse(JSON.parse(dashboard))
          : this.mockSuccessResponse(DEFAULT_DASHBOARD_MOCK);
      case request.method === 'PUT' && request.url.endsWith('api/dashboard'):
        localStorage.setItem('dashboard', JSON.stringify(request.body));
        return this.mockSuccessResponse(request.body);
      default:
        return request.url.startsWith('api') ? this.mockNotFoundResponse() : next.handle(request);
    }
  }

  private mockSuccessResponse<T>(body: T, requestDelay = 1000): Observable<HttpResponse<T>> {
    return of(new HttpResponse({ status: 200, statusText: 'OK', body })).pipe(delay(requestDelay));
  }

  private mockNotFoundResponse<T>(body?: T, requestDelay = 1000): Observable<HttpResponse<T>> {
    return of(new HttpResponse({ status: 404, statusText: 'NOT FOUND', body })).pipe(
      delay(requestDelay)
    );
  }

  private get isMock(): boolean {
    return true;
  }
}
