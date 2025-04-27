import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService, CommandeClient } from '../../services/commande.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-commandes.component.html',
  styleUrls: ['./client-commandes.component.css']
})
export class ClientCommandesComponent implements OnInit {
  commandes: CommandeClient[] = [];
  isLoading = true;
  error: string | null = null;
  selectedStatut: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  showPaymentModal = false;
  paymentCommandeId: number|null = null;
  paymentForm = { numeroCarte: '', dateExpiration: '', cvv: '' };
  paymentLoading = false;
  paymentError: string|null = null;
  paymentSuccess = false;

  cancelLoadingId: number|null = null;
  cancelError: string|null = null;
  cancelSuccessId: number|null = null;

  constructor(private commandeService: CommandeService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.commandeService.getClientCommandes().subscribe({
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

  get filteredCommandes(): CommandeClient[] {
    if (!this.selectedStatut) return this.commandes;
    return this.commandes.filter(cmd =>
      cmd.statut && cmd.statut.trim().toUpperCase() === this.selectedStatut
    );
  }

  get paginatedCommandes(): CommandeClient[] {
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

  openPaymentModal(commandeId: number) {
    this.paymentCommandeId = commandeId;
    this.showPaymentModal = true;
    this.paymentForm = { numeroCarte: '', dateExpiration: '', cvv: '' };
    this.paymentError = null;
    this.paymentSuccess = false;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentCommandeId = null;
    this.paymentForm = { numeroCarte: '', dateExpiration: '', cvv: '' };
    this.paymentError = null;
    this.paymentSuccess = false;
    // Redirect to client-commandes after payment
    this.router.navigate(['/mes-commandes']);
  }

  submitPayment() {
    if (!this.paymentCommandeId) return;
    this.paymentLoading = true;
    this.paymentError = null;
    this.paymentSuccess = false;
    this.commandeService.payCommande(this.paymentCommandeId, this.paymentForm).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.paymentSuccess = true;
        // Update the commande status locally
        const cmd = this.commandes.find(c => c.id === this.paymentCommandeId);
        if (cmd) cmd.statut = 'VALIDEE';
        setTimeout(() => this.closePaymentModal(), 1500);
      },
      error: (err) => {
        this.paymentLoading = false;
        this.paymentError = err.error?.message || 'Erreur lors du paiement.';
      }
    });
  }

  cancelCommande(commandeId: number) {
    this.cancelLoadingId = commandeId;
    this.cancelError = null;
    this.cancelSuccessId = null;
    this.http.put(`http://localhost:8080/api/commandes/${commandeId}/statut?statut=ANNULEE`, {}).subscribe({
      next: () => {
        const cmd = this.commandes.find(c => c.id === commandeId);
        if (cmd) cmd.statut = 'ANNULEE';
        this.cancelLoadingId = null;
        this.cancelSuccessId = commandeId;
        setTimeout(() => {
          if (this.cancelSuccessId === commandeId) this.cancelSuccessId = null;
        }, 1500);
      },
      error: (err) => {
        this.cancelError = err.error?.message || 'Erreur lors de l\'annulation de la commande.';
        this.cancelLoadingId = null;
      }
    });
  }
} 