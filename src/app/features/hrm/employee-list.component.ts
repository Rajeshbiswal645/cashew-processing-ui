import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Employee, EmployeeFormValue, EmployeeStatus } from './hrm.models';
import { HrmService } from './hrm.service';

type EmployeeFilterStatus = EmployeeStatus | 'ALL';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['employeeId', 'name', 'department', 'designation', 'phone', 'status', 'actions'];
  readonly dataSource = new MatTableDataSource<Employee>([]);
  readonly departments = this.hrmService.getDepartments();
  readonly statusOptions: EmployeeFilterStatus[] = ['ALL', 'ACTIVE', 'INACTIVE'];

  readonly filterForm = this.formBuilder.nonNullable.group({
    search: '',
    department: 'ALL',
    status: 'ALL' as EmployeeFilterStatus
  });

  employees: Employee[] = [];
  isLoading = true;
  isSaving = false;
  isDrawerOpen = false;
  selectedEmployee: Employee | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.data.length === 0;
  }

  openCreateDrawer(): void {
    this.selectedEmployee = null;
    this.isDrawerOpen = true;
  }

  editEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedEmployee = null;
  }

  viewEmployee(employee: Employee): void {
    void this.router.navigate(['/employees', employee.employeeId]);
  }

  saveEmployee(payload: EmployeeFormValue): void {
    this.isSaving = true;

    const request$ = this.selectedEmployee
      ? this.hrmService.updateEmployee(this.selectedEmployee.employeeId, payload)
      : this.hrmService.createEmployee(payload);

    request$
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (employee) => {
          this.snackBar.open(
            `${employee.firstName} ${employee.lastName} ${this.selectedEmployee ? 'updated' : 'added'} successfully`,
            'Close',
            { duration: 2400 }
          );
          this.closeDrawer();
          this.loadEmployees();
        }
      });
  }

  statusClass(status: EmployeeStatus): string {
    return status.toLowerCase();
  }

  private loadEmployees(): void {
    this.isLoading = true;
    this.hrmService
      .getEmployees()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((employees) => {
        this.employees = employees;
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    const { search, department, status } = this.filterForm.getRawValue();
    const query = search.trim().toLowerCase();

    this.dataSource.data = this.employees.filter((employee) => {
      const matchesSearch =
        query.length === 0 ||
        employee.employeeId.toLowerCase().includes(query) ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(query);
      const matchesDepartment = department === 'ALL' || employee.department === department;
      const matchesStatus = status === 'ALL' || employee.status === status;
      return matchesSearch && matchesDepartment && matchesStatus;
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
