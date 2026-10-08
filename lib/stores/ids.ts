export function createStoreId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
