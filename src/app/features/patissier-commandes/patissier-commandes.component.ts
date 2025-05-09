import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { CommandeDetailsModalComponent } from '../../components/commandes/commande-details-modal/commande-details-modal.component';

interface Commande {
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
  couches: { saveur: string; epaisseur: number; prix: number }[];
}

@Component({
  selector: 'app-patissier-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, CommandeDetailsModalComponent],
  templateUrl: './patissier-commandes.component.html'
})
export class PatissierCommandesComponent implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  isLoading = true;
  error: string | null = null;
  selectedStatut: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  livraisonLoadingId: number|null = null;
  livraisonError: string|null = null;
  livraisonSuccessId: number|null = null;
  receivedLoadingId: number|null = null;
  receivedError: string|null = null;
  receivedSuccessId: number|null = null;
  private userSub?: Subscription;
  private notifSub?: Subscription;
  showDetailsModal = false;
  selectedCommande: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchCommandes();
    // Subscribe to user info and notifications
    this.userSub = this.authService.currentUser$.subscribe(user => {
      console.log('[PatissierCommandesComponent] currentUser$ emitted:', user);
      if (user && user.patisserieInfo && user.patisserieInfo.id) {
        console.log('[PatissierCommandesComponent] Subscribing to notifications for patisserieId:', user.patisserieInfo.id, 'Type:', typeof user.patisserieInfo.id);
        this.notificationService.subscribeToPatisserieNotifications(user.patisserieInfo.id);
        // Subscribe to notification observable
        if (!this.notifSub) {
          this.notifSub = this.notificationService.getNotifications().subscribe(notification => {
            console.log('[PatissierCommandesComponent] Notification received:', notification);
            // Optionally, add to commandes or show a toast
          });
        }
      } else {
        console.warn('[PatissierCommandesComponent] User is missing patisserieInfo or id, cannot subscribe to notifications. User:', user);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.notifSub?.unsubscribe();
  }

  fetchCommandes() {
    this.isLoading = true;
    this.http.get<Commande[]>('http://localhost:8080/api/commandes/patisserie').subscribe({
      next: (data) => {
        this.commandes = data.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes.';
        this.isLoading = false;
      }
    });
  }

  get filteredCommandes(): Commande[] {
    if (!this.selectedStatut) return this.commandes;
    return this.commandes.filter(cmd =>
      cmd.statut && cmd.statut.trim().toUpperCase() === this.selectedStatut
    );
  }

  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCommandes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCommandes.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  livrerCommande(commandeId: number) {
    this.livraisonLoadingId = commandeId;
    this.livraisonError = null;
    this.livraisonSuccessId = null;
    this.http.put(`http://localhost:8080/api/commandes/${commandeId}/statut?statut=LIVRAISON`, {}).subscribe({
      next: () => {
        const cmd = this.commandes.find(c => c.id === commandeId);
        if (cmd) cmd.statut = 'LIVRAISON';
        this.livraisonLoadingId = null;
        this.livraisonSuccessId = commandeId;
        setTimeout(() => {
          if (this.livraisonSuccessId === commandeId) this.livraisonSuccessId = null;
        }, 1500);
      },
      error: (err) => {
        this.livraisonError = err.error?.message || 'Erreur lors du changement de statut.';
        this.livraisonLoadingId = null;
      }
    });
  }

  receivedCommande(commandeId: number) {
    this.receivedLoadingId = commandeId;
    this.receivedError = null;
    this.receivedSuccessId = null;
    this.http.put(`http://localhost:8080/api/commandes/${commandeId}/statut?statut=TERMINEE`, {}).subscribe({
      next: () => {
        const cmd = this.commandes.find(c => c.id === commandeId);
        if (cmd) cmd.statut = 'TERMINEE';
        this.receivedLoadingId = null;
        this.receivedSuccessId = commandeId;
        setTimeout(() => {
          if (this.receivedSuccessId === commandeId) this.receivedSuccessId = null;
        }, 1500);
      },
      error: (err) => {
        this.receivedError = err.error?.message || 'Erreur lors du changement de statut.';
        this.receivedLoadingId = null;
      }
    });
  }

  openDetailsModal(commande: any) {
    this.selectedCommande = commande;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCommande = null;
  }
} 