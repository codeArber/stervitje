// --- Conversion Factors ---
const CM_TO_INCHES = 0.393701;
const KG_TO_LBS = 2.20462;

// --- Conversion Functions ---
export function cmToInches(cm: number): number {
  return cm * CM_TO_INCHES;
}

export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS;
}
