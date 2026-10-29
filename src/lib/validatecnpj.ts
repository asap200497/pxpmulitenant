// --- utils/cnpj.ts (or inline in the component) ---
export function validateCNPJ(input: string): boolean {
  if (!input) return false;

  const cnpj = input.replace(/\D/g, "");

  // Must be 14 digits and not all identical
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string, factorStart: number) => {
    let sum = 0;
    let factor = factorStart;

    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * factor--;
      if (factor < 2) factor = 9;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  // First check digit: over the first 12 digits, factors 5..2 then 9..2
  const d1 = calcCheckDigit(cnpj.slice(0, 12), 5);
  // Second check digit: over the first 13 digits, factors 6..2 then 9..2
  const d2 = calcCheckDigit(cnpj.slice(0, 12) + String(d1), 6);

  return cnpj.endsWith(`${d1}${d2}`);
}
