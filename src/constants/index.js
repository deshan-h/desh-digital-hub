// Centralized Application Constants

export const SHOP_INFO = {
  name: 'DESH Digital Hub',
  address: '204/1, Pitapahamuna, Melsiripura',
  phone: '071 998 9000',
  cleanPhone: '94719989000',
  description: 'Printing & Digital Services'
};

export const CATEGORY_ORDER = [
  "Printing & Scanning",
  "Document Laminating",
  "Book Binding",
  "Type Setting",
  "Online Services",
  "Downloads & Media",
  "Custom & Utilities"
];

export const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Rev.', 'Dr.', 'Hon.'];

export const DEVICE_TYPES = [
  { value: 'PC', label: 'Desktop PC' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Printer', label: 'Printer' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Other', label: 'Other Device' }
];

export const REPAIR_STATUSES = [
  { value: 'Pending', label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'Completed', label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'Paid', label: 'Paid', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
];

export const COMMON_REPAIR_SERVICES = [
  { name: 'Computer Formatting', price: 1500 },
  { name: 'Software Installation', price: 500 },
  { name: 'Driver Updating', price: 500 },
  { name: 'PC/Laptop service', price: 500 }
];
