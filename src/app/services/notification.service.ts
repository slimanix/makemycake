import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CommandeNotification {
  id: number;
  dateCreation: string;
  montantTotal: number;
  statut: string;
  nombrePersonnes: number;
  glacage: string;
  telephoneClient: string;
  patisserieId: number;
  patisserieNom: string;
  client: {
    id: number;
    fullName: string;
    email: string;
    telephone: string;
  };
  couches: {
    saveur: string;
    epaisseur: number;
    prix: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient!: Client;
  private subscription: StompSubscription | null = null;
  private notificationSubject = new Subject<CommandeNotification>();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notifications: CommandeNotification[] = [];
  private isConnected = false;
  private isConnecting = false;
  private pendingPatisserieId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection() {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-commandes'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      this.isConnected = true;
      this.isConnecting = false;
      if (this.pendingPatisserieId) {
        console.log('[NotificationService] Pending subscription found, subscribing to patisserieId:', this.pendingPatisserieId);
        this.subscribeToPatisserieNotifications(this.pendingPatisserieId);
        this.pendingPatisserieId = null;
      }
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
      this.isConnected = false;
      this.reconnect();
    };

    this.stompClient.onDisconnect = (frame) => {
      console.log('Disconnected from WebSocket');
      this.isConnected = false;
      this.reconnect();
    };

    this.connect();
  }

  private connect() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    try {
      this.stompClient.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    setTimeout(() => {
      this.isConnecting = false;
      this.connect();
    }, 5000);
  }

  getNotifications(): Observable<CommandeNotification> {
    return this.notificationSubject.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  markAsRead() {
    this.unreadCountSubject.next(0);
  }

  getStoredNotifications(): CommandeNotification[] {
    return this.notifications;
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      return await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      const response = await this.http.get(`${environment.apiUrl}/api/push/public-key`, { responseType: 'text' }).toPromise();
      if (!response) {
        throw new Error('Failed to get VAPID public key');
      }

      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(response)
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    this.isConnected = false;
  }

  /**
   * Subscribe to notifications for a specific patisserie
   */
  public subscribeToPatisserieNotifications(patisserieId: number) {
    const topic = `/topic/patisserie/${patisserieId}/nouvelles-commandes`;
    console.log(`[NotificationService] patisserieId value: "${patisserieId}" (type: ${typeof patisserieId})`);
    if (!this.stompClient || !this.isConnected) {
      console.warn('[NotificationService] STOMP client not connected, will subscribe after connect');
      this.pendingPatisserieId = patisserieId;
      return;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    console.log(`[NotificationService] Subscribing to topic: "${topic}" (type: ${typeof topic}) with patisserieId:`, patisserieId);
    this.subscription = this.stompClient.subscribe(
      topic,
      (message) => {
        console.log('[NotificationService] Received message on topic:', topic, 'Message:', message.body);
        const notification = JSON.parse(message.body) as CommandeNotification;
        this.notifications.unshift(notification);
        this.notificationSubject.next(notification);
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      }
    );
  }
} 