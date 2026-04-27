import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Employee, EmployeeFormValue, EmployeeStatus, Gender } from './hrm.models';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnChanges {
  @Input() employee: Employee | null = null;
  @Input() departments: string[] = [];
  @Input() open = false;
  @Input() saving = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveEmployee = new EventEmitter<EmployeeFormValue>();

  readonly genderOptions: Gender[] = ['Male', 'Female', 'Other'];
  readonly statusOptions: EmployeeStatus[] = ['ACTIVE', 'INACTIVE'];

  readonly form = this.formBuilder.group({
    firstName: this.formBuilder.nonNullable.control('', [Validators.required]),
    lastName: this.formBuilder.nonNullable.control('', [Validators.required]),
    email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    phone: this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    dob: this.formBuilder.nonNullable.control('', [Validators.required]),
    gender: this.formBuilder.nonNullable.control<Gender>('Male', [Validators.required]),
    employeeId: this.formBuilder.nonNullable.control('', [Validators.required]),
    department: this.formBuilder.nonNullable.control('', [Validators.required]),
    designation: this.formBuilder.nonNullable.control('', [Validators.required]),
    joiningDate: this.formBuilder.nonNullable.control('', [Validators.required]),
    status: this.formBuilder.nonNullable.control<EmployeeStatus>('ACTIVE', [Validators.required]),
    basicSalary: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    allowances: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    bankAccount: this.formBuilder.nonNullable.control('', [Validators.required])
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['employee'] || changes['open']) && this.open) {
      if (this.employee) {
        this.form.reset({
          firstName: this.employee.firstName,
          lastName: this.employee.lastName,
          email: this.employee.email,
          phone: this.employee.phone,
          dob: this.employee.dob,
          gender: this.employee.gender,
          employeeId: this.employee.employeeId,
          department: this.employee.department,
          designation: this.employee.designation,
          joiningDate: this.employee.joiningDate,
          status: this.employee.status,
          basicSalary: this.employee.basicSalary,
          allowances: this.employee.allowances,
          bankAccount: this.employee.bankAccount
        });
        return;
      }

      this.form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Male',
        employeeId: '',
        department: '',
        designation: '',
        joiningDate: '',
        status: 'ACTIVE',
        basicSalary: null,
        allowances: null,
        bankAccount: ''
      });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.saveEmployee.emit({
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim(),
      phone: raw.phone.trim(),
      dob: raw.dob,
      gender: raw.gender,
      employeeId: raw.employeeId.trim().toUpperCase(),
      department: raw.department,
      designation: raw.designation.trim(),
      joiningDate: raw.joiningDate,
      status: raw.status,
      basicSalary: Number(raw.basicSalary ?? 0),
      allowances: Number(raw.allowances ?? 0),
      bankAccount: raw.bankAccount.trim()
    });
  }
}
