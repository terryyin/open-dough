import { customerLabel } from "./customer.mjs";

export function invoiceLabel(first, last) {
  return `Invoice: ${customerLabel(first, last)}`;
}
