import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);

  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  showSuccess(title: string, message: string, duration = 5000): void {
    this.showNotification('success', title, message, duration);
  }

  /**
   * Show error notification
   */
  showError(title: string, message: string, duration = 8000): void {
    this.showNotification('error', title, message, duration);
  }

  /**
   * Show warning notification
   */
  showWarning(title: string, message: string, duration = 6000): void {
    this.showNotification('warning', title, message, duration);
  }

  /**
   * Show info notification
   */
  showInfo(title: string, message: string, duration = 4000): void {
    this.showNotification('info', title, message, duration);
  }

  /**
   * Show notification with custom type
   */
  private showNotification(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      duration,
    };

    // Add to notifications list
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Show snackbar
    const snackBarMessage = `${title}: ${message}`;
    const snackBarRef = this.snackBar.open(snackBarMessage, 'Close', {
      duration,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    // Remove notification when snackbar is dismissed
    snackBarRef.afterDismissed().subscribe(() => {
      this.removeNotification(notification.id);
    });
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: any, context = 'Operation'): void {
    let title = `${context} Failed`;
    let message = 'An unexpected error occurred. Please try again.';

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.status) {
      switch (error.status) {
        case 400:
          title = 'Bad Request';
          message = 'The request was invalid. Please check your input.';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please log in to continue.';
          break;
        case 403:
          title = 'Access Denied';
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found.';
          break;
        case 429:
          title = 'Rate Limited';
          message = 'Too many requests. Please wait and try again.';
          break;
        case 500:
          title = 'Server Error';
          message = 'A server error occurred. Please try again later.';
          break;
        case 503:
          title = 'Service Unavailable';
          message = 'The service is temporarily unavailable. Please try again later.';
          break;
        default:
          title = `${context} Failed`;
          message = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
      }
    }

    this.showError(title, message);
  }

  /**
   * Show loading state notification
   */
  showLoading(message: string): string {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type: 'info',
      title: 'Loading',
      message,
      timestamp: new Date(),
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    return notification.id;
  }

  /**
   * Hide loading notification
   */
  hideLoading(id: string): void {
    this.removeNotification(id);
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
