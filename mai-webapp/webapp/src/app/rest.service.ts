import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Detection } from 'src/models/Detection';
import { Translation } from 'src/models/Translation';
import { Urls } from 'src/environments/urls.enum';
import { Language } from 'src/models/Language';
import { Audio } from 'src/models/Audio';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) { }

  private getHeaders() {
    return new HttpHeaders()
      .set('Accept', "application/json;charset=UTF-8");
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
        Urls.Languages,
        {
          headers: this.getHeaders()
        }
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
        Urls.Detect,
        {
          headers: this.getHeaders(),
          params: httpParams
        }
      ).pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  public translate(
    sourceLanguageCode: string,
    targetLanguageCode: string,
    text: string): Observable<Translation> {
      const httpParams = new HttpParams()
        .set('sourceLanguageCode', sourceLanguageCode)
        .set('targetLanguageCode', targetLanguageCode)
        .set('text', text);

      return this.http
        .get<Translation>(
          Urls.Translate,
          {
            headers: this.getHeaders(),
            params: httpParams
          }
        ).pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    }

    public textToSpeech(
      sourceLanguageCode: string,
      text: string): Observable<Audio> {
        const httpParams = new HttpParams()
          .set('sourceLanguageCode', sourceLanguageCode)
          .set('text', text);

        return this.http
          .get<Audio>(
            Urls.TextToSpeech,
          {
            headers: this.getHeaders(),
            params: httpParams
          }
        ).pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
      }
}
