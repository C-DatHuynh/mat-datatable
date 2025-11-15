import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
      <mat-label>Search</mat-label>
      <input
        matInput
        (keyup.enter)="onSearch($event)"
        [placeholder]="placeholder || 'Search table data...'"
        #input
        autocomplete="off" />
      <button
        matPrefix
        mat-icon-button
        aria-label="Search"
        (click)="onSearchClick(input)"
        type="button"
        class="search-button">
        <mat-icon>search</mat-icon>
      </button>
      @if (input.value) {
        <button
          matSuffix
          mat-icon-button
          aria-label="Clear search"
          (click)="onClear(input)"
          type="button"
          class="clear-button">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() placeholder?: string;
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.search.emit(searchValue);
  }

  onSearchClick(input: HTMLInputElement): void {
    const mockEvent = new Event('keyup');
    Object.defineProperty(mockEvent, 'target', {
      value: input,
      enumerable: true,
    });
    this.search.emit(input.value);
  }

  onClear(input: HTMLInputElement): void {
    input.value = '';
    this.clear.emit();
  }
}
