import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DialogAction {
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  variant?: 'basic' | 'raised' | 'stroked' | 'flat';
  type: 'button' | 'submit' | 'reset' | 'ok' | 'cancel';
  disabled?: boolean;
  focus?: boolean;
}

export interface DialogOptions {
  title: string;
  actions: DialogAction[];
  showCloseButton: boolean;
  cancelAction?: DialogAction;
}

@Component({
  selector: 'app-base-dialog',
  styleUrl: './base-dialog.component.scss',
  templateUrl: './base-dialog.component.html',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BaseDialogComponent {
  options = input.required<DialogOptions>();
  actionDone = output<DialogAction>();
  defaultCancel: DialogAction = {
    label: 'Cancel',
    color: 'primary',
    type: 'cancel',
  };
  defaultOk: DialogAction = {
    label: 'OK',
    color: 'primary',
    variant: 'stroked',
    type: 'ok',
  };

  allActions = computed(() => {
    const { actions } = this.options();
    // Add default cancel action if none exists and not explicitly disabled
    const hasCancelAction = actions.some(action => action.type === 'cancel');
    if (!hasCancelAction) {
      actions.unshift(this.defaultCancel);
    }

    const hasOkAction = actions.some(action => action.type === 'ok');
    if (!hasOkAction) {
      actions.push(this.defaultOk);
    }

    return actions;
  });

  onAction(value: DialogAction): void {
    this.actionDone.emit(value);
  }

  onClose(): void {
    this.actionDone.emit(this.defaultCancel);
  }
}
