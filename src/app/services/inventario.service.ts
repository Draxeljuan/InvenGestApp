import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:8080/productos'; // URL de productos
  private categoriaUrl = 'http://localhost:8080/categorias'; // URL de categorías
  private estadoUrl = 'http://localhost:8080/estados-producto'; // URL de estados de producto

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  obtenerProducto(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  registrarProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, producto, this.getHeaders()).pipe(
      timeout(3000), // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al registrar producto:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ El registro de productos está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  actualizarProducto(id: string, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al actualizar producto:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La actualización del producto está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondio. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  /** Nuevo método para buscar productos por nombre */
  buscarProductosPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?nombre=${nombre}`, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al buscar productos:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La búsqueda está tardando más de lo esperado...");
          }, 3000);

          setTimeout(() => {
            alert(" Error : La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 7000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  /**Descontinuar productos debe actualizar su estado en lugar de eliminarlo */
  descontinuarProducto(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/descontinuar/${id}`, {}, this.getHeaders()).pipe(
      timeout(3000), // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al descontinuar producto:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La acción de descontinuación está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Alguna tabla puede estar bloqueada, intenta recargar la pagina o contacta con un administrador del sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.categoriaUrl, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al obtener categorías:", err);
        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La carga de categorías está tardando más de lo esperado...");
          }, 5000);
          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Alguna tabla puede estar bloqueada, intenta recargar la pagina o contacta con un administrador del sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);
          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }
        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  crearNuevaCategoria(categoria: any): Observable<any> {
    return this.http.post<any>(`${this.categoriaUrl}/crear`, categoria, this.getHeaders()).pipe(
      timeout(3000), // Si la respuesta no llega en 7s, se lanza error
      catchError(err => {
        console.error(" Error al registrar nueva categoría:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert(" La creación de categorías está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondió. Alguna tabla puede estar bloqueada, recarga la pagina o contacta con un administrador del sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
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