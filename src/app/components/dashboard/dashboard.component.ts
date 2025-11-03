import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CdkDropList, CdkDrag, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/project.service';
import { DashboardService } from '../../services/dashboard.service';
import { Project } from '../../interfaces/project.interface';
import { DashboardItem, DashboardType } from '../../interfaces/dashboard.interface';
import { combineLatest } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SplitButton } from 'primeng/splitbutton';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from 'primeng/button';
import { ProjectWidgetComponent } from '../widgets/project-widget/project-widget.component';
import { TitleCasePipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropList,
    CdkDrag,
    SplitButton,
    InputGroup,
    InputGroupAddon,
    InputText,
    Button,
    ProgressSpinner,
    TitleCasePipe,
    ProjectWidgetComponent,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly projectService = inject(ProjectService);

  readonly projects = signal<Project[]>([]);
  readonly dashboard = signal<DashboardItem[]>([]);
  readonly isDataLoading = signal(false);
  readonly isUpdateLoading = signal(false);

  readonly searchValue = signal('');

  readonly filteredDashboard = computed(() => {
    const searchValue = this.searchValue().toLowerCase();
    return this.dashboard().filter((item) => {
      if (item.type === 'project') {
        return this.getProjectById(item.itemId)?.name?.toLowerCase().includes(searchValue);
      }
      return false;
    });
  });

  readonly actions = computed(() => {
    const unselectedProjects = this.projects().filter(
      (project) => !this.dashboard().some((item) => item.itemId === project.id)
    );
    return unselectedProjects.map((project) => ({
      label: project.name,
      command: () => this.addItem(project.id, 'project'),
    }));
  });

  ngOnInit(): void {
    this.loadData();
  }

  dropItem(event: CdkDragDrop<string[]>) {
    const previousDashboard = [...this.dashboard()];
    const updatedDashboard = [...this.dashboard()];
    moveItemInArray(updatedDashboard, event.previousIndex, event.currentIndex);
    this.updateDashboard(updatedDashboard, previousDashboard);
  }

  addItem(itemId: number, type: DashboardType) {
    const previousDashboard = [...this.dashboard()];
    const updatedDashboard = [...this.dashboard(), { type, itemId }];
    this.updateDashboard(updatedDashboard, previousDashboard);
  }

  removeItem(itemId: number) {
    const previousDashboard = [...this.dashboard()];
    const updatedDashboard = [...this.dashboard()].filter((item) => item.itemId !== itemId);
    this.updateDashboard(updatedDashboard, previousDashboard);
  }

  getProjectById(id: number): Project | undefined {
    return this.projects().find((project) => project.id === id);
  }

  onSearchInput(event: Event) {
    this.searchValue.set((event.target as HTMLInputElement).value);
  }

  private loadData() {
    this.isDataLoading.set(true);
    combineLatest([this.dashboardService.getDashboard(), this.projectService.getProjects()])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ([dashboard, projects]) => {
          this.dashboard.set(dashboard);
          this.projects.set(projects);
          this.isDataLoading.set(false);
        },
        error: () => {
          this.dashboard.set([]);
          this.projects.set([]);
          this.isDataLoading.set(false);
        },
      });
  }

  private updateDashboard(updatedDashboard: DashboardItem[], previousDashboard: DashboardItem[]) {
    this.isUpdateLoading.set(true);
    this.dashboard.set(updatedDashboard);
    this.dashboardService
      .updateDashboard(updatedDashboard)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.isUpdateLoading.set(false);
        },
        error: () => {
          this.dashboard.set(previousDashboard);
          this.isUpdateLoading.set(false);
        },
      });
  }
}
