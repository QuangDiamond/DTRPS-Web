/** Đọc an toàn giá trị trong location.state (kiểu unknown) của React Router */
function readField(state: unknown, key: string): unknown {
  if (typeof state !== 'object' || state === null || !(key in state)) return undefined;
  return (state as Record<string, unknown>)[key];
}

export function getStateString(state: unknown, key: string): string | undefined {
  const value = readField(state, key);
  return typeof value === 'string' ? value : undefined;
}

export function getStateBoolean(state: unknown, key: string): boolean {
  return readField(state, key) === true;
}
