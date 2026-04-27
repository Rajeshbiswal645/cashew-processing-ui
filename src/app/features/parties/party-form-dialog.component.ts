import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Party, PartyCategory, PartyClassification, PartyStatus, PartyUpsertPayload } from './party.model';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: SelectOption[];
}

interface FormSection {
  title: string;
  fields: FieldConfig[];
}

export interface PartyFormDialogData {
  category: PartyCategory;
  party?: Party;
}

@Component({
  selector: 'app-party-form-dialog',
  templateUrl: './party-form-dialog.component.html',
  styleUrls: ['./party-form-dialog.component.scss']
})
export class PartyFormDialogComponent implements OnInit {
  readonly classificationOptions: SelectOption<PartyClassification>[] = [
    { label: 'Small', value: 'Small' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Enterprise', value: 'Enterprise' }
  ];

  readonly statusOptions: SelectOption<PartyStatus>[] = [
    { label: 'Active', value: 'Active' },
    { label: 'Pending Review', value: 'Pending Review' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  readonly contractStatusOptions: SelectOption[] = [
    { label: 'Linked', value: 'Linked' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Expired', value: 'Expired' }
  ];

  readonly sectionConfigs: FormSection[] = [
    {
      title: 'Profile',
      fields: [
        { key: 'category', label: 'Party Type', type: 'select', required: true },
        { key: 'uniqueName', label: 'Unique Name', type: 'text', required: true, placeholder: 'Global Traders' },
        { key: 'legalName', label: 'Legal Name', type: 'text', placeholder: 'Registered entity name' },
        { key: 'classification', label: 'Classification', type: 'select', required: true },
        { key: 'gstin', label: 'GSTIN', type: 'text', placeholder: '29AABTG1286M1Z' }
      ]
    },
    {
      title: 'Contact',
      fields: [
        { key: 'contactPerson', label: 'Contact Person', type: 'text', required: true, placeholder: 'Anita George' },
        { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@company.com' },
        { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 9876543210' },
        { key: 'status', label: 'Status', type: 'select', required: true }
      ]
    },
    {
      title: 'Contract',
      fields: [
        { key: 'contractTitle', label: 'Contract Title', type: 'text', required: true, placeholder: 'RCN Supply' },
        { key: 'contractReference', label: 'Reference', type: 'text', required: true, placeholder: 'CNT-0005' },
        { key: 'contractStatus', label: 'Contract Status', type: 'select', required: true }
      ]
    },
    {
      title: 'Bank Details',
      fields: [
        { key: 'bankName', label: 'Bank', type: 'text', placeholder: 'State Bank of India' },
        { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Global Traders LLP' },
        { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567890' },
        { key: 'ifscCode', label: 'IFSC', type: 'text', placeholder: 'SBIN0012345' }
      ]
    }
  ];

  partyForm!: FormGroup;
  readonly partyOptions: SelectOption<PartyCategory>[] = [
    { label: 'Vendor', value: 'Vendor' },
    { label: 'Buyer', value: 'Buyer' }
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<PartyFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: PartyFormDialogData
  ) {}

  get isEditMode(): boolean {
    return !!this.data.party;
  }

  get dialogTitle(): string {
    return `${this.isEditMode ? 'Edit' : 'Add'} ${this.entityLabel}`;
  }

  get entityLabel(): string {
    return this.partyForm?.get('category')?.value ?? this.data.category;
  }

  get originControls(): FormArray {
    return this.partyForm.get('origin') as FormArray;
  }

  ngOnInit(): void {
    const party = this.data.party;

    this.partyForm = this.formBuilder.group({
      category: [party?.category ?? this.data.category, Validators.required],
      uniqueName: [party?.uniqueName ?? '', Validators.required],
      legalName: [party?.legalName ?? ''],
      classification: [party?.classification ?? 'Small', Validators.required],
      gstin: [party?.gstin ?? ''],
      contactPerson: [party?.contactPerson ?? '', Validators.required],
      email: [party?.email ?? '', [Validators.required, Validators.email]],
      phone: [party?.phone ?? '', Validators.required],
      status: [party?.status ?? 'Active', Validators.required],
      contractTitle: [party?.contract.title ?? '', Validators.required],
      contractReference: [party?.contract.reference ?? '', Validators.required],
      contractStatus: [party?.contract.status ?? 'Linked', Validators.required],
      bankName: [party?.bankDetails.bankName ?? ''],
      accountName: [party?.bankDetails.accountName ?? ''],
      accountNumber: [party?.bankDetails.accountNumber ?? ''],
      ifscCode: [party?.bankDetails.ifscCode ?? ''],
      notes: [party?.notes ?? ''],
      origin: this.formBuilder.array((party?.origin ?? []).map((origin) => this.createOriginControl(origin)))
    });

    if (!this.originControls.length) {
      this.addOrigin();
    }
  }

  getOptions(fieldKey: string): SelectOption[] {
    switch (fieldKey) {
      case 'category':
        return this.partyOptions;
      case 'classification':
        return this.classificationOptions;
      case 'status':
        return this.statusOptions;
      case 'contractStatus':
        return this.contractStatusOptions;
      default:
        return [];
    }
  }

  addOrigin(value = ''): void {
    this.originControls.push(this.createOriginControl(value));
  }

  removeOrigin(index: number): void {
    if (this.originControls.length === 1) {
      this.originControls.at(0).setValue('');
      return;
    }

    this.originControls.removeAt(index);
  }

  submit(): void {
    if (this.partyForm.invalid) {
      this.partyForm.markAllAsTouched();
      return;
    }

    const value = this.partyForm.getRawValue();
    const payload: PartyUpsertPayload = {
      category: value.category,
      uniqueName: value.uniqueName.trim(),
      legalName: value.legalName.trim(),
      classification: value.classification,
      gstin: value.gstin.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      contactPerson: value.contactPerson.trim(),
      status: value.status,
      origin: value.origin.map((entry: string) => entry.trim()).filter(Boolean),
      rating: this.data.party?.rating ?? 4,
      contract: {
        title: value.contractTitle.trim(),
        reference: value.contractReference.trim(),
        status: value.contractStatus
      },
      bankDetails: {
        bankName: value.bankName.trim(),
        accountName: value.accountName.trim(),
        accountNumber: value.accountNumber.trim(),
        ifscCode: value.ifscCode.trim()
      },
      notes: value.notes.trim()
    };

    this.dialogRef.close(payload);
  }

  close(): void {
    this.dialogRef.close();
  }

  private createOriginControl(value = '') {
    return this.formBuilder.control(value, Validators.required);
  }
}
