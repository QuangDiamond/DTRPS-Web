/** Đọc chỉ đường tiếng Việt bằng Web Speech API (miễn phí, có sẵn trên trình duyệt). */
export function speakWebVi(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Bỏ qua nếu trình duyệt chặn speechSynthesis
  }
}

/** Dừng đọc ngay (tắt loa, thoát dẫn đường, rời trang). */
export function stopWebSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Bỏ qua
  }
}
