import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';

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
  @ViewChild('translatedText', { static: false }) translatedText: TextAreaComponent;

  protected languages: Language[];
  protected textToTranslate: string;

  constructor(public _REST: RestService) {  }

  ngOnInit(): void {
    this._REST.languages().subscribe({
      next: (result) => this.languages = result,
    });
  }

  ngAfterViewInit(): void {
    this.textToTranslateArea.getValue().subscribe({
      next: (result) => this.textToTranslate = result,
    });
  }

  protected translate(): void {

    this._REST.detect(this.textToTranslate).subscribe({
      next: (result) => {
        const sourceLang: string = result.language;

        this._REST.translate(sourceLang, 'en', this.textToTranslate).subscribe({
          next: (result) => console.log(result),
          error: (error) => console.error(error),
        });
      }
    });

  }

  protected play(): void {
  }

}
