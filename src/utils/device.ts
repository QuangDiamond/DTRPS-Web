import i18n from 'i18next';
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
            : i18n.t('utils.device.browser');

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
            : i18n.t('utils.device.unknownDevice');

  const icon =
    os === 'iOS' || os === 'Android'
      ? 'phone_iphone'
      : os === 'macOS'
        ? 'laptop_mac'
        : 'desktop_windows';

  return { label: i18n.t('utils.device.on', { browser, os }), icon };
}
