import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Party } from './Party';


@Injectable({
  providedIn: 'root'
})
export class PartyService {
  private readonly baseUrl = `${environment.baseUrl}/parties`;

  constructor(private http: HttpClient) { }

  getParties(): Observable<Party[]> {
    return this.http.get<Party[]>(this.baseUrl);
  }

  getPartyById(id: string): Observable<Party> {
    return this.http.get<Party>(`${this.baseUrl}/${id}`);
  }

  createParty(party: Party): Observable<Party> {
    return this.http.post<Party>(this.baseUrl, party);
  }

  updateParty(id: string, party: Party): Observable<Party> {
    return this.http.put<Party>(`${this.baseUrl}/${id}`, party);
  }
}
