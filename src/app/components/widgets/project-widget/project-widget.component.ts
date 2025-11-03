import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Project } from '../../../interfaces/project.interface';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-widget',
  templateUrl: './project-widget.component.html',
  styleUrl: './project-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Knob, FormsModule, DatePipe],
})
export class ProjectWidgetComponent {
  readonly project = input.required<Project>();

  readonly progress = computed(() => {
    const progress = Math.round((this.project().tasksCompleted / this.project().tasksTotal) * 100);
    return progress > 100 ? 100 : progress;
  });
}
