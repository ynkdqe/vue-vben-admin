/**
 * Salary utility functions for insurance and tax calculations (employee-side)
 * These mirror the C# helpers provided by the user.
 */

export type InsuranceType = 1 | 2; // 1 = Money (fixed), 2 = Percentage

export interface SalaryConfig {
  e_SocialInsurancePercent?: number;
  e_HealthInsurancePercent?: number;
  e_UnemployeeInsurancePercent?: number;
  e_UnionPercent?: number;
  e_MinTaxSalary?: number;
  b_SocialInsurance?: number;
  b_OccAccInsurance?: number;
  b_HealthInsurance?: number;
  b_UnemploymentInsurance?: number;
  b_MinInsuranceSalary?: number;
}

function toNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateESocialInsuranceFee(
  insuranceType: InsuranceType | number,
  insuranceSalary: number,
  config?: SalaryConfig,
): number {
  const t = Number(insuranceType);
  const salary = toNumber(insuranceSalary);
  const pct = config?.e_SocialInsurancePercent ?? 0;
  if (t === 1 || t === 2) {
    return round2(salary * toNumber(pct));
  }
  return 0;
}

export function calculateEHealthInsuranceFee(
  insuranceType: InsuranceType | number,
  insuranceSalary: number,
  config?: SalaryConfig,
): number {
  const t = Number(insuranceType);
  const salary = toNumber(insuranceSalary);
  const pct = config?.e_HealthInsurancePercent ?? 0;
  if (t === 1 || t === 2) {
    return round2(salary * toNumber(pct));
  }
  return 0;
}

export function calculateEUnemployeeInsuranceFee(
  insuranceType: InsuranceType | number,
  insuranceSalary: number,
  config?: SalaryConfig,
): number {
  const t = Number(insuranceType);
  const salary = toNumber(insuranceSalary);
  const pct = config?.e_UnemployeeInsurancePercent ?? 0;
  if (t === 1 || t === 2) {
    return round2(salary * toNumber(pct));
  }
  return 0;
}

/**
 * Calculate personal income tax (TNCN)
 * @param isLaborContract true if contract is FixedTerm or IndefiniteTerm labor contract
 * @param salaryGross gross salary
 * @param taxPercent tax percent (e.g. 10 for 10%)
 * @param config salary config containing e_MinTaxSalary
 */
export function calculateTaxFee(
  isLaborContract: boolean,
  salaryGross: number,
  taxPercent: number,
  config?: SalaryConfig,
): number {
  const gross = toNumber(salaryGross);
  const tax = toNumber(taxPercent);
  const minTaxSalary = toNumber(config?.e_MinTaxSalary ?? 0);

  if (isLaborContract) {
    if (gross > minTaxSalary) {
      return round2((gross - minTaxSalary) * (tax / 100));
    }
    return 0;
  }

  return round2(gross * (tax / 100));
}

export default {
  calculateESocialInsuranceFee,
  calculateEHealthInsuranceFee,
  calculateEUnemployeeInsuranceFee,
  calculateTaxFee,
};
