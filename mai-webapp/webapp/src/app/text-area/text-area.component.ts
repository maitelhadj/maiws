import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Language } from 'src/models/Language';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @Input() inputName: string;
  @Input() disabled: boolean;
  @Input() languages: Language[];
  @Input() selectedLanguage: string;

  @Output() languageSelectionEmitter = new EventEmitter<string>();

  textControl: FormControl;

  ngOnInit() {
    this.textControl = new FormControl({ value: '', disabled: this.disabled });
  }

  protected onLanguageChange(matSelectChangeLanguage: MatSelectChange) {
    this.languageSelectionEmitter.emit(matSelectChangeLanguage.value);
  }

  public getValue(): Observable<string> {
    return this.textControl.valueChanges;
  }

  public setValue(text: string): void {
    this.textControl.setValue(text);
  }

  public clear(): void {
    this.setValue('');
  }
}
