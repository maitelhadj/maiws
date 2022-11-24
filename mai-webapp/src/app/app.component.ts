import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { delay, last, shareReplay } from 'rxjs';

import { Lang } from 'src/enum/lang.enum';
import { Language } from 'src/models/Language';
import { RestService } from './rest.service';
import { TextAreaComponent } from './text-area/text-area.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  protected Lang = Lang;

  @ViewChild('textToTranslateArea', { static: false }) textToTranslateArea: TextAreaComponent;
  @ViewChild('translatedText', { static: false }) translatedTextArea: TextAreaComponent;

  protected languages: Language[];
  protected textToTranslate: string;

  private selectedSourceLanguageCode: string;
  private selectedTargetLanguageCode: string;

  constructor(public _REST: RestService) {  }

  ngOnInit(): void {
    this._REST.languages().subscribe({
      next: (result) => this.languages = result,
    });
  }

  ngAfterViewInit(): void {
    this.textToTranslateArea.getValue().subscribe({
      next: (result) => {
        if (!!result) {
          this.textToTranslate = result;
          this.translate();
        } else {
          this.translatedTextArea.clear();
        }
      }
    });
  }

  protected selectSourceLanguageCode(languageCode: string) {
    this.selectedSourceLanguageCode = languageCode;
  }

  protected selectTargetLanguageCode(languageCode: string) {
    this.selectedTargetLanguageCode = languageCode;
  }

  protected translate(): void {
    if (!!this.selectedSourceLanguageCode && !!this.selectedTargetLanguageCode) {
      if (!!this.textToTranslate) {
        this._REST.translate(this.selectedSourceLanguageCode, this.selectedTargetLanguageCode, this.textToTranslate).subscribe({
          next: (result) => this.translatedTextArea.setValue(result.translatedText),
          error: (error) => console.error(error),
        });
      } else {
        return;
      }
    } else if (!!this.selectedTargetLanguageCode) {
      if (!!this.textToTranslate) {
        this._REST.detect(this.textToTranslate).subscribe({
          next: (result) => {
            const selectedSourceLanguageCode: string = result.language;

            this._REST.translate(selectedSourceLanguageCode, this.selectedTargetLanguageCode, this.textToTranslate).subscribe({
              next: (result) => this.translatedTextArea.setValue(result.translatedText),
              error: (error) => console.error(error),
            });
          }
        });
      } else {
        return;
      }
    }
  }

  protected play(): void {
    this.translatedTextArea.clear();
  }

}
