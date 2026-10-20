/** Sinh 8 mã khôi phục dạng "1234-5678" */
export function generateBackupCodes(count = 8): string[] {
  const random4 = () => String(Math.floor(Math.random() * 10_000)).padStart(4, '0');
  return Array.from({ length: count }, () => `${random4()}-${random4()}`);
}
