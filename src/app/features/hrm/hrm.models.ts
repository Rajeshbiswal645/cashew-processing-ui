export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Paid Leave';
export type Gender = 'Male' | 'Female' | 'Other';
export type PayrollStatus = 'GENERATED' | 'PAID';

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  department: string;
  designation: string;
  joiningDate: string;
  basicSalary: number;
  allowances: number;
  bankAccount: string;
  status: EmployeeStatus;
}

export interface EmployeeFormValue {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  department: string;
  designation: string;
  joiningDate: string;
  basicSalary: number;
  allowances: number;
  bankAccount: string;
  status: EmployeeStatus;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  status: AttendanceStatus;
}

export interface DailyAttendanceRow {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  status: AttendanceStatus;
}

export interface AttendanceReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  attendancePercent: number;
}

export interface EmployeeAttendanceDetail {
  employee: Employee;
  month: string;
  records: AttendanceRecord[];
  summary: AttendanceReportRow;
}

export interface AttendanceReportFilters {
  employeeId: string;
  month: string;
  department: string;
}

export interface DailyAttendanceFilters {
  date: string;
  department: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface LeaveApplicationValue {
  employeeId: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  month: string;
  basicSalary: number;
  allowances: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  perDaySalary: number;
  attendanceDeduction: number;
  otherDeductions: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
}

export interface PayrollGenerationValue {
  month: string;
  employeeId: string;
}

export interface PayslipDetail {
  payroll: PayrollRecord;
  employee: Employee;
  attendanceSummary: AttendanceReportRow;
}
