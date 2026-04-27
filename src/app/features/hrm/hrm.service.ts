import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import {
  AttendanceRecord,
  AttendanceReportFilters,
  AttendanceReportRow,
  AttendanceStatus,
  DailyAttendanceFilters,
  DailyAttendanceRow,
  Employee,
  EmployeeAttendanceDetail,
  EmployeeFormValue,
  LeaveApplicationValue,
  LeaveRecord,
  LeaveStatus,
  PayrollGenerationValue,
  PayrollRecord,
  PayslipDetail
} from './hrm.models';

@Injectable({ providedIn: 'root' })
export class HrmService {
  private readonly endpoint = 'hrm';

  constructor(private readonly api: ApiService) {}

  getDepartments(): string[] {
    return ['ALL', 'Operations', 'Processing', 'Quality', 'Finance', 'Human Resources'];
  }

  getAttendanceStatuses(): AttendanceStatus[] {
    return ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];
  }

  getAvailableMonths(): string[] {
    return ['2026-04'];
  }

  getEmployees(): Observable<Employee[]> {
    return this.api.get<any[]>(`${this.endpoint}/employees`).pipe(map((rows) => rows.map((row) => this.toEmployee(row))));
  }

  getEmployeeById(employeeId: string): Observable<Employee | undefined> {
    return this.api.get<any>(`${this.endpoint}/employees/${employeeId}`).pipe(map((row) => this.toEmployee(row)));
  }

  createEmployee(payload: EmployeeFormValue): Observable<Employee> {
    return this.api.post<any>(`${this.endpoint}/employees`, payload).pipe(map((row) => this.toEmployee(row)));
  }

  updateEmployee(currentEmployeeId: string, payload: EmployeeFormValue): Observable<Employee> {
    return this.api.put<any>(`${this.endpoint}/employees/${currentEmployeeId}`, payload).pipe(map((row) => this.toEmployee(row)));
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.api.get<any[]>(`${this.endpoint}/attendance`).pipe(map((rows) => rows.map((row) => this.toAttendance(row))));
  }

  getDailyAttendance(filters: DailyAttendanceFilters): Observable<DailyAttendanceRow[]> {
    return this.api
      .get<any[]>(`${this.endpoint}/attendance/daily`, {
        date: filters.date,
        department: filters.department
      })
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            employeeId: row.employeeId,
            employeeName: row.employeeName,
            department: row.department,
            designation: row.designation,
            status: row.status as AttendanceStatus
          }))
        )
      );
  }

  saveDailyAttendance(date: string, rows: DailyAttendanceRow[]): Observable<AttendanceRecord[]> {
    return this.api.post<any[]>(`${this.endpoint}/attendance/daily?date=${encodeURIComponent(date)}`, rows).pipe(
      map((records) => records.map((record) => this.toAttendance(record)))
    );
  }

  getAttendanceReport(filters: AttendanceReportFilters): Observable<AttendanceReportRow[]> {
    return this.api
      .get<any[]>(`${this.endpoint}/attendance/report`, {
        employeeId: filters.employeeId,
        month: filters.month,
        department: filters.department
      })
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            employeeId: row.employeeId,
            employeeName: row.employeeName,
            department: row.department,
            month: row.month,
            totalDays: Number(row.totalDays ?? 0),
            presentDays: Number(row.presentDays ?? 0),
            absentDays: Number(row.absentDays ?? 0),
            leaveDays: Number(row.leaveDays ?? 0),
            halfDays: Number(row.halfDays ?? 0),
            attendancePercent: Number(row.attendancePercent ?? 0)
          }))
        )
      );
  }

  getEmployeeAttendanceDetail(employeeId: string, month: string): Observable<EmployeeAttendanceDetail | undefined> {
    return this.api.get<any>(`${this.endpoint}/attendance/detail/${employeeId}`, { month }).pipe(
      map((detail) => ({
        employee: this.toEmployee(detail.employee),
        month: detail.month,
        records: (detail.records ?? []).map((record: any) => this.toAttendance(record)),
        summary: {
          employeeId: detail.summary.employeeId,
          employeeName: detail.summary.employeeName,
          department: detail.summary.department,
          month: detail.summary.month,
          totalDays: Number(detail.summary.totalDays ?? 0),
          presentDays: Number(detail.summary.presentDays ?? 0),
          absentDays: Number(detail.summary.absentDays ?? 0),
          leaveDays: Number(detail.summary.leaveDays ?? 0),
          halfDays: Number(detail.summary.halfDays ?? 0),
          attendancePercent: Number(detail.summary.attendancePercent ?? 0)
        }
      }))
    );
  }

  getLeaves(): Observable<LeaveRecord[]> {
    return this.api.get<any[]>(`${this.endpoint}/leaves`).pipe(map((rows) => rows.map((row) => this.toLeave(row))));
  }

  applyLeave(payload: LeaveApplicationValue): Observable<LeaveRecord> {
    return this.api.post<any>(`${this.endpoint}/leaves`, payload).pipe(map((row) => this.toLeave(row)));
  }

  updateLeaveStatus(leaveId: string, status: LeaveStatus): Observable<LeaveRecord> {
    return this.api.put<any>(`${this.endpoint}/leaves/${leaveId}/status?status=${encodeURIComponent(status)}`, {}).pipe(
      map((row) => this.toLeave(row))
    );
  }

  getPayroll(month = '2026-04'): Observable<PayrollRecord[]> {
    return this.api.get<any[]>(`${this.endpoint}/payroll`, { month }).pipe(map((rows) => rows.map((row) => this.toPayroll(row))));
  }

  generatePayroll(payload: PayrollGenerationValue): Observable<PayrollRecord[]> {
    return this.api.post<any[]>(`${this.endpoint}/payroll/generate`, payload).pipe(map((rows) => rows.map((row) => this.toPayroll(row))));
  }

  markPayrollPaid(payrollId: string): Observable<PayrollRecord> {
    return this.api.put<any>(`${this.endpoint}/payroll/${payrollId}/paid`, {}).pipe(map((row) => this.toPayroll(row)));
  }

  getPayslip(payrollId: string): Observable<PayslipDetail | undefined> {
    return this.api.get<any>(`${this.endpoint}/payroll/${payrollId}/payslip`).pipe(
      map((detail) => ({
        payroll: this.toPayroll(detail.payroll),
        employee: this.toEmployee(detail.employee),
        attendanceSummary: {
          employeeId: detail.attendanceSummary.employeeId,
          employeeName: detail.attendanceSummary.employeeName,
          department: detail.attendanceSummary.department,
          month: detail.attendanceSummary.month,
          totalDays: Number(detail.attendanceSummary.totalDays ?? 0),
          presentDays: Number(detail.attendanceSummary.presentDays ?? 0),
          absentDays: Number(detail.attendanceSummary.absentDays ?? 0),
          leaveDays: Number(detail.attendanceSummary.leaveDays ?? 0),
          halfDays: Number(detail.attendanceSummary.halfDays ?? 0),
          attendancePercent: Number(detail.attendanceSummary.attendancePercent ?? 0)
        }
      }))
    );
  }

  private toEmployee(row: any): Employee {
    return {
      employeeId: row.employeeId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      dob: row.dob,
      gender: row.gender,
      department: row.department,
      designation: row.designation,
      joiningDate: row.joiningDate,
      basicSalary: Number(row.basicSalary ?? 0),
      allowances: Number(row.allowances ?? 0),
      bankAccount: row.bankAccount,
      status: row.status
    };
  }

  private toAttendance(row: any): AttendanceRecord {
    return {
      id: String(row.id),
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      department: row.department,
      date: row.date,
      status: row.status as AttendanceStatus
    };
  }

  private toLeave(row: any): LeaveRecord {
    return {
      id: String(row.id),
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      leaveType: row.leaveType,
      fromDate: row.fromDate,
      toDate: row.toDate,
      reason: row.reason,
      status: row.status as LeaveStatus,
      appliedOn: row.appliedOn
    };
  }

  private toPayroll(row: any): PayrollRecord {
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      designation: row.designation,
      department: row.department,
      month: row.month,
      basicSalary: Number(row.basicSalary ?? 0),
      allowances: Number(row.allowances ?? 0),
      absentDays: Number(row.absentDays ?? 0),
      leaveDays: Number(row.leaveDays ?? 0),
      halfDays: Number(row.halfDays ?? 0),
      perDaySalary: Number(row.perDaySalary ?? 0),
      attendanceDeduction: Number(row.attendanceDeduction ?? 0),
      otherDeductions: Number(row.otherDeductions ?? 0),
      deductions: Number(row.deductions ?? 0),
      netSalary: Number(row.netSalary ?? 0),
      status: row.status
    };
  }
}
