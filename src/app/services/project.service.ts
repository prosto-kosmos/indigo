import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('api/projects');
  }
}
