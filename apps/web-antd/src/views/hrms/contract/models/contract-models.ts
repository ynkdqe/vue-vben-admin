import type { Dayjs } from 'dayjs';

export type Id = number | string;

export interface ContractFormModel {
  contractTypeId: Id;
  contractDurationId: Id;
  employeeId: Id;
  employeeName?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  identification?: string;
  birthDate?: string | undefined;
  tax?: number | string | undefined;

  effectiveDate?: Dayjs | undefined;
  expiryDate?: Dayjs | undefined;
  basicSalary?: number | undefined;
  kpi?: number | undefined;
  allowance?: number | undefined;
  salaryGross?: number | undefined;
  insuranceType?: Id | undefined;
  insuranceValue?: number | undefined;
  insuranceSalary?: number | undefined;

  eSocialInsuranceFee?: number | undefined;
  eHealthInsuranceFee?: number | undefined;
  eUnemploymentInsuranceFee?: number | undefined;
  eUnionFee?: number | undefined;
  eTaxFee?: number | undefined;

  salaryNet?: number | undefined;

  cSocialInsuranceFee?: number | undefined;
  cCalculateOccAccInsuranceFee?: number | undefined;
  cHealthInsuranceFee?: number | undefined;
  cUnemploymentInsuranceFee?: number | undefined;
  totalCost?: number | undefined;

  status?: Id | undefined;
  checkers?: Id[];
  approver?: Id | undefined;
  notes?: string;
}

export default {};
