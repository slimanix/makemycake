import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommandeCouches {
  saveur: string;
  epaisseur: number;
  prix: number;
}

export interface CommandeClient {
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
  couches: CommandeCouches[];
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = 'http://localhost:8080/api/commandes/client';

  constructor(private http: HttpClient) {}

  getClientCommandes(): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(this.apiUrl);
  }

  payCommande(commandeId: number, paymentData: { numeroCarte: string; dateExpiration: string; cvv: string }) {
    return this.http.post(`http://localhost:8080/api/commandes/${commandeId}/paiement`, paymentData);
  }
} 