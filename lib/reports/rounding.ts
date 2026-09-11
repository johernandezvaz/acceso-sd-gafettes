export function redondearHoras(horasDecimal: number): number {
  if (!isFinite(horasDecimal) || horasDecimal < 0) return 0
  return Math.floor(horasDecimal) + (horasDecimal % 1 >= 0.5 ? 1 : 0)
}
