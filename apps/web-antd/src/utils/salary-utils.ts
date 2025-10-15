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
  // If true, tax should be calculated using a fixed percent supplied in e_TaxPercent
  e_IsTaxFixed?: boolean;
  e_TaxPercent?: number;
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

  // If contract type indicates fixed tax, prefer its configured percent
  const isFixed = Boolean(config?.e_IsTaxFixed);
  const fixedPct = toNumber(config?.e_TaxPercent ?? tax);

  if (isFixed) {
    // For labor contracts, apply min tax salary deduction first
    if (isLaborContract) {
      if (gross > minTaxSalary) {
        return round2((gross - minTaxSalary) * (fixedPct / 100));
      }
      return 0;
    }
    return round2(gross * (fixedPct / 100));
  }

  // Progressive tax calculation (lũy tiến)
  // Taxable income: for labor contracts apply deduction, otherwise use gross directly
  const taxable = isLaborContract ? Math.max(0, gross - minTaxSalary) : gross;

  if (taxable <= 0) return 0;

  // Vietnam-style progressive brackets (monthly):
  // up to 5,000,000: 5%
  // 5,000,001 - 10,000,000: 10%
  // 10,000,001 - 18,000,000: 15%
  // 18,000,001 - 32,000,000: 20%
  // 32,000,001 - 52,000,000: 25%
  // 52,000,001 - 80,000,000: 30%
  // above 80,000,000: 35%
  const brackets: Array<{ limit: number; rate: number }> = [
    { limit: 5_000_000, rate: 5 },
    { limit: 10_000_000, rate: 10 },
    { limit: 18_000_000, rate: 15 },
    { limit: 32_000_000, rate: 20 },
    { limit: 52_000_000, rate: 25 },
    { limit: 80_000_000, rate: 30 },
    { limit: Number.POSITIVE_INFINITY, rate: 35 },
  ];

  let remaining = taxable;
  let lower = 0;
  let totalTax = 0;

  for (const br of brackets) {
    const upper = br.limit;
    const slice = Math.max(0, Math.min(remaining, upper - lower));
    if (slice > 0) {
      totalTax += slice * (br.rate / 100);
      remaining -= slice;
    }
    lower = upper;
    if (remaining <= 0) break;
  }

  return round2(totalTax);
}

export default {
  calculateESocialInsuranceFee,
  calculateEHealthInsuranceFee,
  calculateEUnemployeeInsuranceFee,
  calculateTaxFee,
};
