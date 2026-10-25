export const statusOptions = [
  { label: 'Yapılacak', value: 'OPEN', severity: 'secondary' },
  { label: 'Devam ediyor', value: 'IN_PROGRESS', severity: 'warning' },
  { label: 'Tamamlandı', value: 'DONE', severity: 'success' },
];
export const statusOption = value => statusOptions.find(item => item.value === value) || statusOptions[0];
