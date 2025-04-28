import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, CommandeNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  notifications: CommandeNotification[] = [];
  isDropdownOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );

    this.notifications = this.notificationService.getStoredNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.notificationService.markAsRead();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'LIVRAISON':
        return 'bg-purple-100 text-purple-800';
      case 'TERMINEE':
        return 'bg-green-100 text-green-800';
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 