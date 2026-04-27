import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, finalize } from 'rxjs/operators';
import { Party, PartyCategory, PartyStatus, PartyUpsertPayload } from './party.model';
import { PartyFormDialogComponent } from './party-form-dialog.component';
import { PartiesService } from './parties.service';

@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent implements OnInit {
  readonly tabs: PartyCategory[] = ['Vendor', 'Buyer'];
  readonly statusOptions: PartyStatus[] = ['Active', 'Pending Review', 'Inactive'];
  readonly classificationOptions = ['All', 'Small', 'Medium', 'Enterprise'];

  filterForm: FormGroup = this.formBuilder.group({
    search: [''],
    classification: ['All'],
    status: ['All']
  });

  parties: Party[] = [];
  filteredParties: Party[] = [];
  selectedCategory: PartyCategory = 'Vendor';
  selectedParty: Party | null = null;
  loading = false;
  actionInProgress = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly partiesService: PartiesService
  ) {}

  ngOnInit(): void {
    this.loadParties();
    this.filterForm.valueChanges.pipe(debounceTime(250)).subscribe(() => this.loadParties());
  }

  setCategory(category: PartyCategory): void {
    if (this.selectedCategory === category) {
      return;
    }

    this.selectedCategory = category;
    this.filterForm.patchValue({ search: '', classification: 'All', status: 'All' }, { emitEvent: false });
    this.loadParties();
  }

  applyFilters(): void {
    const classification = this.filterForm.get('classification')?.value;
    this.filteredParties = this.parties.filter((party) => classification === 'All' || party.classification === classification);

    if (!this.filteredParties.length) {
      this.selectedParty = null;
      return;
    }

    const currentSelection = this.selectedParty
      ? this.filteredParties.find((party) => party.id === this.selectedParty?.id)
      : null;

    this.selectedParty = currentSelection ?? this.filteredParties[0];
  }

  selectParty(party: Party): void {
    this.selectedParty = party;
  }

  openCreateDialog(): void {
    this.openPartyDialog(this.selectedCategory);
  }

  editParty(party: Party): void {
    this.openPartyDialog(party.category, party);
  }

  deleteParty(party: Party): void {
    const confirmed = window.confirm(`Delete ${party.uniqueName}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.actionInProgress = true;
    this.partiesService
      .delete(party.id)
      .pipe(finalize(() => (this.actionInProgress = false)))
      .subscribe({
        next: () => {
          this.parties = this.parties.filter((entry) => entry.id !== party.id);
          this.applyFilters();
          this.loadParties();
          this.snackBar.open(`${party.category} deleted`, 'Close', { duration: 2500 });
        },
        error: () => {
          this.snackBar.open(`Could not delete ${party.uniqueName}`, 'Close', { duration: 3000 });
        }
      });
  }

  getRatingStars(party: Party): string[] {
    return Array.from({ length: 5 }, (_, index) => (index < party.rating ? 'star' : 'star_outline'));
  }

  trackByParty(_: number, party: Party): string {
    return party.id;
  }

  private loadParties(preferredPartyId?: string): void {
    const filters = this.filterForm.getRawValue();
    this.loading = true;
    this.partiesService
      .list({
        type: this.selectedCategory,
        status: filters.status,
        search: filters.search
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (parties) => {
          this.parties = parties;
          this.applyFilters();
          if (preferredPartyId) {
            this.selectedParty = this.filteredParties.find((entry) => entry.id === preferredPartyId) ?? this.selectedParty;
          }
        },
        error: () => {
          this.snackBar.open('Unable to load party records from the API.', 'Close', { duration: 3500 });
        }
      });
  }

  private openPartyDialog(category: PartyCategory, party?: Party): void {
    const dialogRef = this.dialog.open(PartyFormDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      panelClass: 'party-form-dialog-panel',
      disableClose: true,
      data: { category, party }
    });

    dialogRef.afterClosed().subscribe((payload?: PartyUpsertPayload) => {
      if (!payload) {
        return;
      }

      this.actionInProgress = true;
      const request$ = party
        ? this.partiesService.update(party.id, payload)
        : this.partiesService.create(payload);

      request$
        .pipe(finalize(() => (this.actionInProgress = false)))
        .subscribe({
          next: (savedParty) => {
            this.selectedCategory = savedParty.category;
            this.loadParties(savedParty.id);
            this.snackBar.open(`${savedParty.category} ${party ? 'updated' : 'created'} successfully`, 'Close', {
              duration: 2500
            });
          },
          error: () => {
            this.snackBar.open(`Could not save ${category.toLowerCase()} details.`, 'Close', { duration: 3000 });
          }
      });
    });
  }
}
