import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { debounceTime } from 'rxjs';

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
  protected languagesWithAuto: Language[];

  protected textToTranslate: string;
  protected translatedText: string;

  protected selectedSourceLanguageCode: string = '';
  protected selectedTargetLanguageCode: string = 'en';

  constructor(public _REST: RestService) {  }

  ngOnInit(): void {
    this._REST.languages().subscribe({
      next: (result) => {
        this.languages = [...result];
        this.languagesWithAuto = [...result];

        this.languagesWithAuto.unshift({ code: '', name: '-- AUTO --' });
      },
    });
  }

  ngAfterViewInit(): void {
    this.initSubscription();
  }

  private initSubscription(): void {
    this.textToTranslateArea.getValue().pipe(debounceTime(500)).subscribe({
      next: (result) => {
        if (!!result) {
          this.textToTranslate = result;
          this.translate();
        } else {
          this.translatedTextArea.clear();
        }
      }
    });

    this.translatedTextArea.getValue().subscribe({
      next: (result) => {
        this.translatedText = result;
      }
    });
  }

  protected selectSourceLanguageCode(languageCode: string) {
    this.selectedSourceLanguageCode = languageCode;
    this.translate();
  }

  protected selectTargetLanguageCode(languageCode: string) {
    this.selectedTargetLanguageCode = languageCode;
    this.translate();
  }

  protected translate(): void {
    if (!!this.selectedSourceLanguageCode && !!this.selectedTargetLanguageCode) {
      if (!!this.textToTranslate) {
        this._REST.translate(this.selectedSourceLanguageCode, this.selectedTargetLanguageCode, this.textToTranslate).subscribe({
          next: (result) => this.translatedTextArea.setValue(result.translatedText),
          error: (error) => console.error(error)
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
              error: (error) => console.error(error)
            });
          }
        });
      } else {
        return;
      }
    }
  }

  private toArrayBuffer(buffer: Buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
  }

  protected play() {
    this._REST.textToSpeech(this.selectedTargetLanguageCode, this.translatedText).subscribe({
      next: async (result) => {
        const Buffer = require('buffer/').Buffer

        const audioBytes
          = this.toArrayBuffer(Buffer.from(result.bytes, 'base64'));

        const context = new AudioContext();
        const buffer
          = await context.decodeAudioData(audioBytes);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
      },
      error: (error) => console.error(error)
    });
  }
}
