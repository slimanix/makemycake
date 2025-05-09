import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeClient } from '../../../services/commande.service';

@Component({
  selector: 'app-commande-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh] relative">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white rounded-t-2xl px-6 pt-6 pb-4 flex justify-between items-center border-b">
          <div class="flex items-center gap-3">
            <span *ngIf="commande"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              [ngClass]="statusClass">
              {{ commande.statut }}
            </span>
            <h2 class="text-2xl font-bold text-gray-800">Détails de la Commande</h2>
          </div>
          <button (click)="close()" class="text-gray-400 hover:text-gray-700 p-2 rounded-full transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-6 px-6 py-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4 bg-pink-50 rounded-lg p-4">
            <div>
              <p class="text-xs text-gray-500">Date de création</p>
              <p class="font-semibold text-gray-800">{{commande.dateCreation | date:'medium'}}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Nombre de personnes</p>
              <p class="font-semibold text-gray-800">{{commande.nombrePersonnes}}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Montant total</p>
              <p class="font-bold text-pink-600 text-lg">{{commande.montantTotal}} DH</p>
            </div>
          </div>

          <!-- Patisserie Info -->
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-3 border">
            <svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 2C13.1046 2 14 2.89543 14 4V5H10V4C10 2.89543 10.8954 2 12 2ZM4 7V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V7H4ZM6 7V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V7" />
            </svg>
            <div>
              <h3 class="text-base font-semibold mb-1">Pâtisserie</h3>
              <p class="font-medium text-gray-700">{{commande.patisserieNom}}</p>
            </div>
          </div>

          <!-- Layers -->
          <div class="bg-white rounded-lg shadow p-4 border">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2" />
              </svg>
              <h3 class="text-base font-semibold">Couches</h3>
            </div>
            <div class="divide-y">
              <div *ngFor="let couche of commande.couches" class="flex justify-between items-center py-2">
                <div>
                  <p class="font-medium capitalize">{{couche.saveur}}</p>
                  <p class="text-xs text-gray-500">Épaisseur: {{couche.epaisseur}} cm</p>
                </div>
                <p class="font-semibold text-pink-600">{{couche.prix}} DH</p>
              </div>
            </div>
          </div>

          <!-- Frosting -->
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-3 border">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3C10 7 16 7 14 11C12 15 6 13 6 17C6 19 9 21 12 21C15 21 18 19 18 17C18 13 12 15 10 11C8 7 14 7 12 3Z" />
            </svg>
            <div>
              <h3 class="text-base font-semibold mb-1">Glacage</h3>
              <p class="font-medium capitalize">{{commande.glacage}}</p>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="bg-white rounded-lg shadow p-4 border">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="text-base font-semibold">Informations Client</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Nom</p>
                <p class="font-medium">{{commande.client.fullName}}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Email</p>
                <p class="font-medium break-all">{{commande.client.email}}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Téléphone</p>
                <p class="font-medium">{{commande.client.telephone}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white rounded-b-2xl px-6 py-4 flex justify-end border-t">
          <button (click)="close()" class="px-5 py-2 text-gray-600 hover:text-white hover:bg-pink-500 rounded-lg font-semibold transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  `
})
export class CommandeDetailsModalComponent {
  @Input() commande!: CommandeClient;
  @Output() closeModal = new EventEmitter<void>();

  get statusClass(): string {
    const statut = this.commande?.statut?.trim().toUpperCase();
    switch (statut) {
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      case 'VALIDEE': return 'bg-green-100 text-green-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARATION': return 'bg-purple-100 text-purple-800';
      case 'LIVRAISON': return 'bg-indigo-100 text-indigo-800';
      case 'TERMINEE': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  close() {
    this.closeModal.emit();
  }
} 