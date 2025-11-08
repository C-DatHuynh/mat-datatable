import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BaseDialogComponent, DialogAction } from './base-dialog.component';

export interface ActionDialogData {
  title: string;
  message: string;
  actions: DialogAction[];
}

@Component({
  selector: 'app-action-dialog',
  template: `
    <app-base-dialog
      [options]="{ title: data.title, actions: data.actions, showCloseButton: true }"
      (actionDone)="onAction($event)">
      <p>{{ data.message }}</p>
    </app-base-dialog>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, BaseDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ActionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ActionDialogComponent, any>,
    @Inject(MAT_DIALOG_DATA) public data: ActionDialogData
  ) {}

  onAction(action: DialogAction): void {
    this.dialogRef.close(action);
  }
}
