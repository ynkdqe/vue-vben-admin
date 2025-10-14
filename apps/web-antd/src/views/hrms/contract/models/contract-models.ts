import type { Dayjs } from 'dayjs';

export type Id = number | string;

export interface ContractFormModel {
  contractTypeId: number | undefined;
  contractName: string | undefined;
  employeeId: number | undefined;
  employeeName?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  identification?: string;
  birthDate?: string | undefined;
  tax?: number | undefined;

  effectiveDate?: Dayjs | undefined;
  expiryDate?: Dayjs | undefined;
  basicSalary?: number | undefined;
  kpi?: number | undefined;
  allowance?: number | undefined;
  salaryGross?: number | undefined;
  insuranceType?: Id | undefined;
  insuranceValue?: number | undefined;
  insuranceSalary?: number | undefined;

  employeeSocialInsuranceFee?: number | undefined;
  employeeHealthInsuranceFee?: number | undefined;
  employeeUnemploymentInsuranceFee?: number | undefined;
  employeeUnionFee?: number | undefined;
  taxFee?: number | undefined;

  salaryNet?: number | undefined;

  businessSocialInsuranceFee?: number | undefined;
  businessCalculateOccAccInsuranceFee?: number | undefined;
  businessHealthInsuranceFee?: number | undefined;
  businessUnemploymentInsuranceFee?: number | undefined;
  totalCost?: number | undefined;

  status?: Id | undefined;
  checkers?: Id[];
  approver?: Id | undefined;
  notes?: string;
}

export default {};
