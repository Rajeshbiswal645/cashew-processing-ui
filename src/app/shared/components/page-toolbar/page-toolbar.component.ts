import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-toolbar',
  templateUrl: './page-toolbar.component.html',
  styleUrls: ['./page-toolbar.component.scss']
})
export class PageToolbarComponent {
  @Input() title: string = '';
  @Input() showAdd: boolean = false;
  @Input() addLabel: string = 'Add';
  @Output() add = new EventEmitter<void>();

  onAdd() {
    this.add.emit();
  }
}
