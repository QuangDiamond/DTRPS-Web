import { useEffect } from 'react';

const APP_NAME = 'SmartTravel Admin';

/** Đặt tiêu đề tab trình duyệt: "<Trang> · SmartTravel Admin" */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
