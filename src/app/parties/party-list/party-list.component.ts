import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PartyFormComponent } from '../party-form/party-form.component';

export interface Party {
  party_id: string;
  unique_name: string;
  party_type: string;
  legal_name: string;
  contact_info: string;
  gstin: string;
  status: string;
  classification?: string;
  bank_details?: string;
}

@Component({
  selector: 'app-party-list',
  templateUrl: './party-list.component.html',
  styleUrls: ['./party-list.component.scss']
})
export class PartyListComponent implements OnInit {

  displayedColumns: string[] = [
    'unique_name',
    'party_type',
    'legal_name',
    'contact_info',
    'gstin',
    'status',
    'actions'
  ];

  parties: Party[] = [
    {
      party_id: 'P001',
      unique_name: 'ABC Traders',
      party_type: 'Customer',
      legal_name: 'ABC Pvt Ltd',
      contact_info: '9876543210',
      gstin: '27ABCDE1234F1Z5',
      status: 'Active'
    },
    {
      party_id: 'P002',
      unique_name: 'XYZ Suppliers',
      party_type: 'Vendor',
      legal_name: 'XYZ Ltd',
      contact_info: '9123456780',
      gstin: '27XYZDE1234G1Z9',
      status: 'Inactive'
    }
  ];

  dataSource: MatTableDataSource<Party> = new MatTableDataSource(this.parties);

  // Filter values
  filterValues: { unique_name: string; party_type: string; status: string } = {
    unique_name: '',
    party_type: '',
    status: ''
  };

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Custom filter predicate for multiple fields
    this.dataSource.filterPredicate = (data: Party, filter: string) => {
      const searchTerms = JSON.parse(filter);
      return (!searchTerms.unique_name || data.unique_name.toLowerCase().includes(searchTerms.unique_name)) &&
             (!searchTerms.party_type || data.party_type.toLowerCase().includes(searchTerms.party_type)) &&
             (!searchTerms.status || data.status.toLowerCase() === searchTerms.status);
    };
  }

  applyAdvancedFilter(): void {
    this.dataSource.filter = JSON.stringify({
      unique_name: (this.filterValues.unique_name || '').trim().toLowerCase(),
      party_type: (this.filterValues.party_type || '').trim().toLowerCase(),
      status: (this.filterValues.status || '').trim().toLowerCase()
    });
  }

  resetFilters(): void {
    this.filterValues = { unique_name: '', party_type: '', status: '' };
    this.applyAdvancedFilter();
  }

  openPartyForm(): void {
    const dialogRef = this.dialog.open(PartyFormComponent, {
      width: '550px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe((result: Party) => {
      if (result) {
        this.parties.push(result);
        this.dataSource.data = [...this.parties];
      }
    });
  }

  editParty(party: Party): void {
    const dialogRef = this.dialog.open(PartyFormComponent, {
      width: '550px',
      disableClose: true,
      data: party
    });

    dialogRef.afterClosed().subscribe((result: Party) => {
      if (result) {
        const index = this.parties.findIndex(p => p.party_id === result.party_id);
        if (index !== -1) {
          this.parties[index] = result;
          this.dataSource.data = [...this.parties];
        }
      }
    });
  }

  deleteParty(id: string): void {
    if (confirm('Are you sure you want to delete this party?')) {
      this.parties = this.parties.filter(p => p.party_id !== id);
      this.dataSource.data = [...this.parties];
    }
  }
}
