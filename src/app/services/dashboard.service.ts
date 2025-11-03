import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardItem } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>('api/dashboard');
  }

  updateDashboard(dashboard: DashboardItem[]): Observable<DashboardItem[]> {
    return this.http.put<DashboardItem[]>('api/dashboard', dashboard);
  }
}
