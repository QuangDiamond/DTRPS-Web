/** Sao chép văn bản vào clipboard — trả về false nếu trình duyệt chặn quyền */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
