import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RcnBatch } from '../../../batches/models/batch.models';
import { RcnService } from './rcn.service';

@Component({
  selector: 'app-rcn',
  templateUrl: './rcn.component.html',
  styleUrls: ['./rcn.component.scss']
})
export class RcnComponent implements OnInit {
  displayedColumns: string[] = ['rcn_id', 'vendor', 'origin', 'net_weight', 'moisture', 'status', 'actions'];
  dataSource = new MatTableDataSource<RcnBatch>([]);
  filterValue = '';

  constructor(private rcnService: RcnService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.rcnService.list().subscribe(batches => {
      this.dataSource.data = batches;
    });
  }

  applyFilter(value: string) {
    this.filterValue = value.trim().toLowerCase();
    this.dataSource.filter = this.filterValue;
  }

  addNew() {
    // open dialog or navigate to add form
    console.log('add new rcn');
  }

  edit(batch: RcnBatch) {
    console.log('edit', batch);
  }

  remove(batch: RcnBatch) {
    this.rcnService.delete(batch.rcn_id).subscribe(() => this.load());
  }
}
