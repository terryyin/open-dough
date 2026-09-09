import { customerLabel } from "./customer.mjs";
import { invoiceLabel } from "./invoice.mjs";
console.log(process.argv[4] === "invoice" ? invoiceLabel(process.argv[2], process.argv[3]) : customerLabel(process.argv[2], process.argv[3]));
