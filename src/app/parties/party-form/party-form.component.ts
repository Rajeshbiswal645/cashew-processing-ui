import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-party-form',
  templateUrl: './party-form.component.html',
  styleUrls: ['./party-form.component.scss']
})
export class PartyFormComponent implements OnInit {

  partyForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PartyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.data;

    this.partyForm = this.fb.group({
      party_id: [this.data?.party_id || "P" + Date.now()],
      uniqueName: [this.data?.unique_name || "", Validators.required],
      partyType: [this.data?.party_type || "", Validators.required],
      legalName: [this.data?.legal_name || ""],
      classification: [this.data?.classification || ""],
      gstin: [this.data?.gstin || ""],
      contactInfo: [this.data?.contact_info || ""],
      bankDetails: [this.data?.bank_details || ""],
      status: [this.data?.status || "Active"]
    });
  }

  onSubmit() {
    if (this.partyForm.invalid) return;

    const formatted = {
      party_id: this.partyForm.value.party_id,
      unique_name: this.partyForm.value.uniqueName,
      party_type: this.partyForm.value.partyType,
      legal_name: this.partyForm.value.legalName,
      classification: this.partyForm.value.classification,
      gstin: this.partyForm.value.gstin,
      contact_info: this.partyForm.value.contactInfo,
      bank_details: this.partyForm.value.bankDetails,
      status: this.partyForm.value.status
    };

    this.dialogRef.close(formatted);
  }

  close() {
    this.dialogRef.close();
  }
}
