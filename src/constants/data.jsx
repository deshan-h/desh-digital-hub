import { Printer, Layers, FileText, Download, Code, Settings, Type } from 'lucide-react';

export const POS_CATEGORIES = [
  {
    category: 'Printing & Scanning',
    icon: Printer,
    color: 'text-blue-400',
    items: [
      { id: 'ps-1', name: 'Printout / Photocopy [B/W]', price: 10 },
      { id: 'ps-2', name: 'Printout / Photocopy [Color]', price: 20 },
      { id: 'ps-3', name: 'Scan', price: 20 },
      { id: 'ps-4', name: 'Budget Print', price: 5 },
    ]
  },
  {
    category: 'Document Laminating',
    icon: Layers,
    color: 'text-emerald-400',
    items: [
      { id: 'lb-1', name: 'Laminating [NIC Size]', price: 50 },
      { id: 'lb-2', name: 'Laminating [A4]', price: 150 },
      { id: 'lb-3', name: 'Laminating [Legal]', price: 200 },
      { id: 'lb-4', name: 'Laminating [A3]', price: 250 },
    ]
  },
  {
    category: 'Book Binding',
    icon: FileText,
    color: 'text-orange-400',
    items: [
      { id: 'bb-1', name: 'Book Binding [pgs > 20]', price: 200 },
      { id: 'bb-2', name: 'Book Binding [pgs > 50]', price: 300 },
      { id: 'bb-3', name: 'Book Binding [pgs < 100]', price: 400 },
      { id: 'bb-4', name: 'Book Binding - Tape Binding', price: 250 },
    ]
  },
  {
    category: 'Type Setting',
    icon: Type,
    color: 'text-orange-400',
    items: [
      { id: 'ge-1', name: 'CV [Without Photo]', price: 250 },
      { id: 'ge-2', name: 'CV [With Photo]', price: 350 },
      { id: 'ge-3', name: 'CV [Advanced + ATS]', price: 800 },
      { id: 'ge-4', name: 'Name Tag', price: 120 },
      { id: 'ge-5', name: 'Name Stickers [Color]', price: 100 },
      { id: 'ge-6', name: 'Name Stickers [B/W]', price: 80 },
      { id: 'ge-7', name: 'Book Cover Design', price: 200 },
    ]
  },
  {
    category: 'Online Services',
    icon: Code,
    color: 'text-purple-400',
    items: [
      { id: 'os-1', name: 'Online App [Per Page]', price: 150 },
      { id: 'os-2', name: 'Campus Application', price: 400 },
      { id: 'os-3', name: 'Email', price: 50 },
      { id: 'os-4', name: 'Vehicle Licence renewal', price: 150 },
    ]
  },
  {
    category: 'Downloads & Media',
    icon: Download,
    color: 'text-yellow-400',
    items: [
      { id: 'dm-1', name: 'Images', price: 5 },
      { id: 'dm-2', name: 'Mp3 Songs', price: 1 },
      { id: 'dm-3', name: 'Movies', price: 50 },
      { id: 'dm-4', name: 'Video Songs', price: 20 },
      { id: 'dm-5', name: 'Software [1GB]', price: 100 },
      { id: 'dm-6', name: 'Games [1GB]', price: 100 },
      { id: 'dm-7', name: 'Exam Result Sheet', price: 50 },
    ]
  },
  {
    category: 'Custom & Utilities',
    icon: Settings,
    color: 'text-slate-400',
    items: [
      { id: 'cu-1', name: 'Custom Item', price: 0 },
    ]
  }
];
