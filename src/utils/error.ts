import i18n from 'i18next';
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : i18n.t('utils.error.somethingWentWrongPlease');
}
