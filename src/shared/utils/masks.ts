export function formatDocument(value: string): string {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    return formatCpf(value);
  }

  return formatCnpj(value);
}

export function formatCpf(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCnpj(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 14);

  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatDate(value: string): string {
  const numbers = value.replace(/\D/g, '');

  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatZipcode(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
}

export function removeMask(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskEmail(value: string): string {
  const [local, domain] = value.split('@');

  if (!domain || local.length === 0) {
    return value;
  }

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
