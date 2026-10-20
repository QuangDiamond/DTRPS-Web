/** Mô tả trình duyệt + hệ điều hành hiện tại, ví dụ "Chrome trên macOS" */
export function describeCurrentDevice(): { label: string; icon: string } {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;

  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : 'Trình duyệt';

  const os = /iPhone|iPad/.test(userAgent)
    ? 'iOS'
    : /Android/.test(userAgent)
      ? 'Android'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS X/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'thiết bị không xác định';

  const icon =
    os === 'iOS' || os === 'Android'
      ? 'phone_iphone'
      : os === 'macOS'
        ? 'laptop_mac'
        : 'desktop_windows';

  return { label: `${browser} trên ${os}`, icon };
}
