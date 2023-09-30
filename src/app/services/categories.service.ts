import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environments';
import { Category } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl = ` ${environment.API_URL}/api`;

  constructor(private http: HttpClient) {}

  getAll(limit?: number, offset?: number) {
    let params = new HttpParams();
    if (limit && offset != null) {
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, { params });
  }
}
