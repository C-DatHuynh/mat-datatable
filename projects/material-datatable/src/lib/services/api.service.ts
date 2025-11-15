import { HttpClient, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, makeEnvironmentProviders, Provider, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { DataFilters, DataPagination, DataSorting } from './datastore.service';

export interface ApiServiceInterface<T> {
  setHeaders(header: HttpHeaders): void;
  list(): Observable<T[]>;
  listRemote(
    pagination: DataPagination | null,
    filters: DataFilters | null,
    sorting: DataSorting | null
  ): Observable<{ data: T[]; total: number }>;
  add(dto: T): Observable<T>;
  update(id: number | string, dto: Exclude<T, { id: number | string }>): Observable<T>;
  remove(id: number | string): Observable<void>;
}

export const API_SERVICE_TOKEN = new InjectionToken<ApiServiceInterface<any>>('ApiService');

@Injectable()
export class ApiService<T> implements ApiServiceInterface<T> {
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  protected baseUrl: string = '';

  constructor(private readonly http: HttpClient) {}

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setHeaders(header: HttpHeaders): void {
    this.headers = header;
  }

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl, { headers: this.headers });
  }

  listRemote(
    pagination: DataPagination | null,
    filters: DataFilters | null,
    sorting: DataSorting | null
  ): Observable<{ data: T[]; total: number }> {
    return new Observable<{ data: T[]; total: number }>();
  }

  add(dto: T): Observable<T> {
    return this.http.post<T>(this.baseUrl, dto, { headers: this.headers });
  }

  update(id: number | string, dto: Exclude<T, { id: number | string }>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, dto, { headers: this.headers });
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers });
  }
}

type UseClassOption<T> = { useClass: Type<ApiServiceInterface<T>> };
type UseBaseUrlOption<T> = { useBaseUrl: string };
export type ApiServiceOptions<T> = UseClassOption<T> | UseBaseUrlOption<T> | { useExternalData: true };

export function provideApiService<T>(options: ApiServiceOptions<T>) {
  let providers: Provider[] = [];
  if ('useClass' in options) {
    providers = [
      // ensure the class is provided (in case it isn't providedIn: 'root')
      options.useClass,
      { provide: API_SERVICE_TOKEN, useExisting: options.useClass },
    ];
  } else if ('useExternalData' in options && options.useExternalData) {
    providers = [
      {
        provide: API_SERVICE_TOKEN,
        useFactory: (http: HttpClient) => new ApiService<T>(http),
        deps: [HttpClient],
      },
    ];
  } else if ('useBaseUrl' in options) {
    providers = [
      {
        provide: API_SERVICE_TOKEN,
        useFactory: (http: HttpClient) => {
          const service = new ApiService<T>(http);
          service.setBaseUrl(options.useBaseUrl);
          return service;
        },
        deps: [HttpClient],
      },
    ];
  } else {
    throw new Error('Invalid ApiServiceOptions provided.');
  }
  return makeEnvironmentProviders([provideHttpClient(), ...providers]);
}
