import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:8080/productos'; // URL de productos
  private categoriaUrl = 'http://localhost:8080/categorias'; // URL de categorías
  private estadoUrl = 'http://localhost:8080/estados-producto'; // URL de estados de producto

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  obtenerProducto(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  registrarProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, producto, this.getHeaders());
  }

  actualizarProducto(id: string, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto, this.getHeaders());
  }

  /** Nuevo método para buscar productos por nombre */
  buscarProductosPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?nombre=${nombre}`, this.getHeaders());
  }

  /**Descontinuar productos debe actualizar su estado en lugar de eliminarlo */
  descontinuarProducto(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/descontinuar/${id}`, {}, this.getHeaders()); // Estado "Descontinuado"
}

  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.categoriaUrl, this.getHeaders());
  }

  crearNuevaCategoria(categoria: any): Observable<any> {
    return this.http.post<any>(`${this.categoriaUrl}/crear`, categoria, this.getHeaders());
  }

  obtenerEstados(): Observable<any[]> {
    return this.http.get<any[]>(this.estadoUrl, this.getHeaders());
  }

  private getHeaders() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return { headers };
  }
}