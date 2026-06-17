/** Generate employee code with prefix "D" followed by the employee ID padded to 5 digits (e.g. "D00001") */
export function generateEmployeeCode(id: number): string {
  return `D${String(id).padStart(5, '0')}`
}
