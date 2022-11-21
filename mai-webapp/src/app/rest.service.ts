import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Detection } from 'src/models/Detection';
import { Translation } from 'src/models/Translation';
import { Urls } from 'src/environments/urls.enum';
import { Language } from 'src/models/Language';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) { }

  private getBaseUrl(): string {
    return environment.backOfficeUrlPrefix;
  }

  private getHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: "application/json;charset=UTF-8",
      }),
    };

    return httpOptions;
  }

  private handleError(httpErrorResponse: HttpErrorResponse) {
    if (httpErrorResponse.error instanceof ErrorEvent) {
      console.error('RestService handleError : ', httpErrorResponse.error.message);
    } else {
      console.error('Backend returned code ' + httpErrorResponse.status + ', body was : ' + httpErrorResponse.error)
    }

    return throwError(() => new Error('Problème rencontré'));
  }

  public languages(): Observable<Language[]> {
    return this.http
      .get<Language[]>(
        this.getBaseUrl() + Urls.Languages
      ).pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  public detect(text: string): Observable<Detection> {
    const httpParams = new HttpParams()
      .set('text', text);

    return this.http
      .get<Detection>(
        this.getBaseUrl() + Urls.Detect,
        {
          params: httpParams,
        }
      ).pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  public translate(
    sourceLang: string,
    targetLang: string,
    text: string): Observable<Translation> {
      const httpParams = new HttpParams()
        .set('sourceLang', sourceLang)
        .set('targetLang', targetLang)
        .set('text', text);

      return this.http
        .get<Translation>(
          this.getBaseUrl() + Urls.Translate,
          {
            params: httpParams,
          }
        ).pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    }
}
