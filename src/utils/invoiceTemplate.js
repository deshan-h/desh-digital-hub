import { format } from 'date-fns';
import logo from '../assets/logo.webp';

const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

// =========================================================================
// 1. STANDARD SALES & POS INVOICE TEMPLATE (A5 PORTRAIT - SYSTEM COLORS)
// =========================================================================
export const generateInvoiceHtml = (sale) => {
  const date = parseTimestamp(sale.timestamp);
  const items = sale.cartItems || [];

  const itemsHtml = items.map((item, index) => `
    <tr>
      <td class="text-center" style="color: #64748b; font-size: 9px;">${(index + 1).toString().padStart(2, '0')}</td>
      <td class="text-left" style="color: #1e293b; font-weight: 600;">${item.name}</td>
      <td class="text-center" style="color: #475569;">Rs ${Number(item.price).toFixed(2)}</td>
      <td class="text-center" style="color: #475569;">${item.qty}</td>
      <td class="text-right" style="color: #0f172a; font-weight: 700;">Rs ${(Number(item.price) * Number(item.qty)).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - #${sale.id.slice(0, 6).toUpperCase()}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @page { 
          size: A5 portrait; 
          margin: 0; 
        }
        
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 10px 0; 
          background: #f1f5f9; 
          color: #0f172a;
          font-size: 10px;
          display: flex;
          justify-content: center;
        }
        
        .invoice-box {
          width: 148mm;
          min-height: 208mm;
          max-width: 148mm;
          margin: 0 auto;
          padding: 20px 22px 28px 22px;
          position: relative;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
        }
        
        .logo-section {
          width: 50%;
        }
        .logo-section img {
          height: 52px;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .logo-underline {
          width: 110px;
          height: 3px;
          background: linear-gradient(90deg, #1d4ed8, #0284c7);
          border-radius: 2px;
          margin-top: 2px;
        }

        .title-section {
          width: 50%;
          text-align: right;
        }
        .title-section h1 {
          color: #1d4ed8; 
          font-size: 28px;
          font-weight: 900;
          margin: 0 0 6px 0;
          letter-spacing: 1.5px;
          line-height: 1;
        }
        
        .meta-grid {
          display: inline-grid;
          grid-template-columns: auto auto;
          gap: 2px 10px;
          text-align: right;
          font-size: 9px;
          color: #64748b;
        }
        .meta-grid .val {
          color: #0f172a;
          font-weight: 700;
        }

        /* Invoice To & Intro */
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 15px;
        }
        
        .invoice-to {
          width: 48%;
        }
        .invoice-to-title {
          color: #0284c7;
          font-weight: 800;
          font-size: 9.5px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 3px;
          color: #0f172a;
        }
        .customer-details {
          color: #64748b;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .intro-text {
          width: 48%;
          font-size: 8.5px;
          color: #64748b;
          line-height: 1.4;
          background: #f8fafc;
          border-left: 2.5px solid #0284c7;
          padding: 6px 8px;
          border-radius: 2px;
        }
        .intro-text strong {
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        /* Table */
        .table-wrapper {
          margin-bottom: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: linear-gradient(90deg, #071739 0%, #1d4ed8 70%, #0284c7 100%);
        }
        th {
          color: white;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 7px 8px;
          letter-spacing: 0.5px;
        }
        th.bg-dark {
          background: #071739; 
        }
        
        tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }
        tbody td {
          padding: 8px 8px;
          font-size: 9.5px;
        }

        /* Footer Info */
        .bottom-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .totals-box {
          width: 45%;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 9.5px;
          color: #64748b;
        }
        .totals-row .val { color: #0f172a; font-weight: 700; }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          background: linear-gradient(135deg, #071739 0%, #1d4ed8 100%);
          color: white;
          padding: 8px 10px;
          font-weight: 800;
          font-size: 13px;
          margin-top: 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* Absolute Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          gap: 15px;
        }
        .contact-col {
          width: 48%;
        }
        .thank-you {
          color: #1d4ed8;
          font-weight: 800;
          font-size: 11px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 5px;
          font-size: 8.5px;
          color: #64748b;
        }
        .icon-box {
          width: 18px;
          height: 18px;
          background: #0284c7;
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          shrink: 0;
        }

        .terms-col {
          width: 48%;
        }
        .terms-title {
          font-weight: 800;
          font-size: 10px;
          margin-bottom: 4px;
          color: #0f172a;
        }
        .terms-text {
          font-size: 8px;
          color: #64748b;
          line-height: 1.4;
        }
        
        /* Bottom Decoration */
        .bottom-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 16px;
          display: flex;
        }
        .dec-blue { width: 45%; background: #0284c7; }
        .dec-angle { 
          width: 0;
          height: 0;
          border-left: 16px solid #0284c7;
          border-bottom: 16px solid #071739;
        }
        .dec-black { flex: 1; background: #071739; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }

        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .invoice-box {
            box-shadow: none;
            width: 148mm;
            min-height: 208mm;
            padding: 16px 18px 24px 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        
        <div>
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <img src="${window.location.origin}${logo}" alt="Logo" />
              <div class="logo-underline"></div>
            </div>
            <div class="title-section">
              <h1>INVOICE</h1>
              <div class="meta-grid">
                <span>Invoice Number:</span> <span class="val">#${sale.id.slice(0,6).toUpperCase()}</span>
                <span>Cashier:</span> <span class="val">${sale.userEmail ? sale.userEmail.split('@')[0] : (sale.userId || 'Admin')}</span>
                <span>Invoice Date:</span> <span class="val">${format(date, 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          <!-- Invoice To -->
          <div class="info-row">
            <div class="invoice-to">
              <div class="invoice-to-title">INVOICE TO:</div>
              <div class="customer-name">${sale.customerName || 'Walk-in Customer'}</div>
              <div class="customer-details">
                Client of DESH Digital Hub.<br>
                Date: ${format(date, 'MMM dd, yyyy')}<br>
                Time: ${format(date, 'h:mm a')}
              </div>
            </div>
            <div class="intro-text">
              <strong>Dear Valued Client,</strong>
              Thank you for choosing DESH Digital Hub. This document serves as the official transaction record of your purchase. For inquiries, please contact us below.
            </div>
          </div>

          <!-- Table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 8%;">NO.</th>
                  <th class="text-left">PRODUCT / SERVICE DESCRIPTION</th>
                  <th class="text-center bg-dark" style="width: 18%;">PRICE</th>
                  <th class="text-center bg-dark" style="width: 12%;">QTY</th>
                  <th class="text-right bg-dark" style="width: 22%;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || `
                  <tr>
                    <td class="text-center" style="color: #64748b;">01</td>
                    <td class="text-left" style="color: #1e293b; font-weight: 600;">${sale.description}</td>
                    <td class="text-center" style="color: #64748b;">-</td>
                    <td class="text-center" style="color: #64748b;">1</td>
                    <td class="text-right" style="color: #0f172a; font-weight: 700;">Rs ${Number(sale.amount).toFixed(2)}</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Bottom Info -->
          <div class="bottom-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span class="val">Rs ${Number(sale.amount).toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Discount:</span>
                <span class="val">Rs 0.00</span>
              </div>
              <div class="grand-total">
                <span>Total Amount:</span>
                <span>Rs ${Number(sale.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <!-- Footer -->
          <div class="footer">
            <div class="contact-col">
              <div class="thank-you">Thank You For Your Business</div>
              
              <div class="contact-item">
                <div class="icon-box">📞</div>
                +94(71) 998 9000 / 077 123 4567
              </div>
              <div class="contact-item">
                <div class="icon-box">✉️</div>
                deshdigitalhub@gmail.com
              </div>
              <div class="contact-item">
                <div class="icon-box">📍</div>
                204/1, In Front Of Diwrumgala, Pitapahamuna, Melsiripura
              </div>
            </div>
            
            <div class="terms-col">
              <div class="terms-title">Terms & Conditions:</div>
              <div class="terms-text">
                Goods sold are not returnable unless defective.
                Services & repairs are backed by standard DESH Hub warranty as applicable.
                Please retain this receipt for any inquiries.
              </div>
            </div>
          </div>

          <!-- Bottom Graphic -->
          <div class="bottom-decoration">
            <div class="dec-blue"></div>
            <div class="dec-angle"></div>
            <div class="dec-black"></div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};

// =========================================================================
// 2. DEDICATED UTILITY BILL PAYMENT RECEIPT (A5 PORTRAIT - SYSTEM COLORS)
// =========================================================================
export const generateUtilityReceiptHtml = (sale) => {
  const date = parseTimestamp(sale.timestamp);
  const utilityItem = (sale.cartItems && sale.cartItems.find(i => i.isUtility)) || {};

  let billAmount = Number(utilityItem.billAmount || sale.billAmount || 0);
  let accountNo = utilityItem.accountNumber || sale.accountNumber || '';
  let refNo = utilityItem.referenceNumber || sale.referenceNumber || '';
  let provider = utilityItem.provider || 'Utility Bill Payment';

  // Fallback parsers if saved in description
  if (!billAmount && sale.description) {
    const match = sale.description.match(/Bill:\s*Rs\s*([0-9.]+)/i);
    if (match) billAmount = Number(match[1]);
  }
  if (!accountNo && sale.description) {
    const match = sale.description.match(/A\/C:\s*([^|)]+)/i);
    if (match) accountNo = match[1].trim();
  }
  if (!refNo && sale.description) {
    const match = sale.description.match(/Ref:\s*([^|)]+)/i);
    if (match) refNo = match[1].trim();
  }

  const serviceFee = Number(sale.amount || utilityItem.price || 50);
  const totalPaid = billAmount + serviceFee;
  const receiptId = (sale.id || Math.random().toString(36).substring(2, 8)).slice(0, 8).toUpperCase();
  const formattedDate = format(date, 'MMM dd, yyyy');
  const formattedTime = format(date, 'hh:mm a');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Utility Receipt - #UB-${receiptId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @page { 
          size: A5 portrait; 
          margin: 0; 
        }
        
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 10px 0; 
          background: #f1f5f9; 
          color: #0f172a;
          font-size: 10px;
          display: flex;
          justify-content: center;
        }
        
        .invoice-box {
          width: 148mm;
          min-height: 208mm;
          max-width: 148mm;
          margin: 0 auto;
          padding: 20px 22px 28px 22px;
          position: relative;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .logo-section {
          width: 50%;
        }
        .logo-section img {
          height: 52px;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .logo-underline {
          width: 110px;
          height: 3px;
          background: linear-gradient(90deg, #1d4ed8, #0284c7);
          border-radius: 2px;
          margin-top: 2px;
        }

        .title-section {
          width: 50%;
          text-align: right;
        }
        .title-section h1 {
          color: #1d4ed8; 
          font-size: 26px;
          font-weight: 900;
          margin: 0 0 4px 0;
          letter-spacing: 1px;
          line-height: 1;
        }
        .title-section .subtitle-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        
        .meta-grid {
          display: inline-grid;
          grid-template-columns: auto auto;
          gap: 2px 10px;
          text-align: right;
          font-size: 9px;
          color: #64748b;
        }
        .meta-grid .val {
          color: #0f172a;
          font-weight: 700;
        }

        /* Customer & Official Notice */
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 15px;
        }
        
        .invoice-to {
          width: 48%;
        }
        .invoice-to-title {
          color: #0284c7;
          font-weight: 800;
          font-size: 9.5px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 3px;
          color: #0f172a;
        }
        .customer-details {
          color: #64748b;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .intro-text {
          width: 48%;
          font-size: 8.5px;
          color: #64748b;
          line-height: 1.4;
          background: #f8fafc;
          border-left: 2.5px solid #0284c7;
          padding: 6px 8px;
          border-radius: 2px;
        }
        .intro-text strong {
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        /* Utility Provider Highlight Card */
        .utility-banner {
          background: linear-gradient(90deg, #eff6ff 0%, #e0f2fe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .utility-brand {
          font-size: 13px;
          font-weight: 800;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .utility-brand-icon {
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #1d4ed8;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }
        .utility-meta {
          text-align: right;
          font-size: 9.5px;
        }
        .utility-meta .ac-val {
          font-weight: 800;
          color: #0f172a;
          font-family: monospace;
          letter-spacing: 0.5px;
        }
        .utility-meta .ref-val {
          color: #475569;
          font-size: 8.5px;
        }

        /* Table */
        .table-wrapper {
          margin-bottom: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: linear-gradient(90deg, #071739 0%, #1d4ed8 70%, #0284c7 100%);
        }
        th {
          color: white;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 7px 8px;
          letter-spacing: 0.5px;
        }
        th.bg-dark {
          background: #071739; 
        }
        
        tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }
        tbody td {
          padding: 9px 8px;
          font-size: 9.5px;
        }

        /* Bottom Section & Totals */
        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;
          gap: 15px;
        }

        .status-stamp-box {
          width: 48%;
        }
        .status-stamp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ecfdf5;
          border: 1.5px solid #059669;
          color: #047857;
          border-radius: 6px;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .status-sub {
          font-size: 8px;
          color: #64748b;
          margin-top: 4px;
          line-height: 1.3;
        }

        .totals-box {
          width: 48%;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3.5px 0;
          font-size: 9.5px;
          color: #64748b;
        }
        .totals-row .val { color: #0f172a; font-weight: 700; }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          background: linear-gradient(135deg, #071739 0%, #1d4ed8 100%);
          color: white;
          padding: 8px 10px;
          font-weight: 800;
          font-size: 13px;
          margin-top: 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* Absolute Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          gap: 15px;
        }
        .contact-col {
          width: 48%;
        }
        .thank-you {
          color: #1d4ed8;
          font-weight: 800;
          font-size: 11px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 5px;
          font-size: 8.5px;
          color: #64748b;
        }
        .icon-box {
          width: 18px;
          height: 18px;
          background: #0284c7;
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          shrink: 0;
        }

        .terms-col {
          width: 48%;
        }
        .terms-title {
          font-weight: 800;
          font-size: 10px;
          margin-bottom: 4px;
          color: #0f172a;
        }
        .terms-text {
          font-size: 8px;
          color: #64748b;
          line-height: 1.4;
        }
        
        /* Bottom Decoration */
        .bottom-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 16px;
          display: flex;
        }
        .dec-blue { width: 45%; background: #0284c7; }
        .dec-angle { 
          width: 0;
          height: 0;
          border-left: 16px solid #0284c7;
          border-bottom: 16px solid #071739;
        }
        .dec-black { flex: 1; background: #071739; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }

        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .invoice-box {
            box-shadow: none;
            width: 148mm;
            min-height: 208mm;
            padding: 16px 18px 24px 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        
        <div>
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <img src="${window.location.origin}${logo}" alt="Logo" />
              <div class="logo-underline"></div>
            </div>
            <div class="title-section">
              <h1>UTILITY RECEIPT</h1>
              <div class="subtitle-tag">Official Payment Voucher</div>
              <div class="meta-grid">
                <span>Receipt Number:</span> <span class="val">#UB-${receiptId}</span>
                <span>Counter Agent:</span> <span class="val">${sale.userEmail ? sale.userEmail.split('@')[0] : (sale.userId || 'Counter 01')}</span>
                <span>Payment Date:</span> <span class="val">${formattedDate}</span>
                <span>Payment Time:</span> <span class="val">${formattedTime}</span>
              </div>
            </div>
          </div>

          <!-- Customer & Agency Info -->
          <div class="info-row">
            <div class="invoice-to">
              <div class="invoice-to-title">CUSTOMER INFORMATION:</div>
              <div class="customer-name">${sale.customerName || 'Counter Customer'}</div>
              <div class="customer-details">
                Payment Channel: Cash Counter Agent<br>
                Service Center: DESH Digital Hub Melsiripura<br>
                Receipt Status: Completed & Synchronized
              </div>
            </div>
            <div class="intro-text">
              <strong>Official Receipt Certification:</strong>
              This voucher certifies that the specified utility bill payment has been accepted and processed at DESH Digital Hub authorized agency counter.
            </div>
          </div>

          <!-- Utility Provider Highlight Card -->
          <div class="utility-banner">
            <div class="utility-brand">
              <div class="utility-brand-icon">⚡</div>
              <span>${provider}</span>
            </div>
            <div class="utility-meta">
              <div>Account: <span class="ac-val">${accountNo || 'N/A'}</span></div>
              <div class="ref-val">Ref / TXN: ${refNo || 'Counter Confirmed'}</div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 8%;">NO.</th>
                  <th class="text-left">BILL & SERVICE DESCRIPTION</th>
                  <th class="text-center bg-dark" style="width: 32%;">ACCOUNT / REF NO</th>
                  <th class="text-right bg-dark" style="width: 25%;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center" style="color: #64748b; font-size: 9px;">01</td>
                  <td class="text-left" style="color: #1e293b; font-weight: 700;">${provider} Bill Payment Settlement</td>
                  <td class="text-center" style="color: #475569; font-family: monospace;">${accountNo || 'Counter Verified'}</td>
                  <td class="text-right" style="color: #0f172a; font-weight: 700;">Rs ${billAmount > 0 ? billAmount.toFixed(2) : '0.00'}</td>
                </tr>
                <tr>
                  <td class="text-center" style="color: #64748b; font-size: 9px;">02</td>
                  <td class="text-left" style="color: #1e293b; font-weight: 600;">Counter Processing & Agency Fee</td>
                  <td class="text-center" style="color: #64748b; font-size: 8.5px;">Authorized Agency Service</td>
                  <td class="text-right" style="color: #0f172a; font-weight: 700;">Rs ${serviceFee.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Info -->
          <div class="bottom-section">
            <div class="status-stamp-box">
              <div class="status-stamp">
                <span>✔</span>
                <span>Payment Accepted & Settled</span>
              </div>
              <div class="status-sub">
                Official billing statement will reflect payment within 24-48 hours via national utility banking gateway.
              </div>
            </div>

            <div class="totals-box">
              <div class="totals-row">
                <span>Bill Amount:</span>
                <span class="val">Rs ${billAmount > 0 ? billAmount.toFixed(2) : '0.00'}</span>
              </div>
              <div class="totals-row">
                <span>Counter Agency Fee:</span>
                <span class="val">Rs ${serviceFee.toFixed(2)}</span>
              </div>
              <div class="grand-total">
                <span>Total Paid:</span>
                <span>Rs ${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <!-- Footer -->
          <div class="footer">
            <div class="contact-col">
              <div class="thank-you">Thank You For Choosing DESH Hub</div>
              
              <div class="contact-item">
                <div class="icon-box">📞</div>
                +94(71) 998 9000 / 077 123 4567
              </div>
              <div class="contact-item">
                <div class="icon-box">✉️</div>
                deshdigitalhub@gmail.com
              </div>
              <div class="contact-item">
                <div class="icon-box">📍</div>
                204/1, In Front Of Diwrumgala, Pitapahamuna, Melsiripura
              </div>
            </div>
            
            <div class="terms-col">
              <div class="terms-title">Important Instructions:</div>
              <div class="terms-text">
                Please retain this printed receipt as proof of bill payment.
                In case of any inquiry or dispute with the service provider, this receipt serves as counter verification.
              </div>
            </div>
          </div>

          <!-- Bottom Graphic -->
          <div class="bottom-decoration">
            <div class="dec-blue"></div>
            <div class="dec-angle"></div>
            <div class="dec-black"></div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};

// =========================================================================
// 3. DEDICATED PC & DEVICE REPAIR INVOICE & ESTIMATE (A5 - POS SYSTEM DESIGN)
// =========================================================================
export const generateRepairInvoiceHtml = (job, isEstimate = false) => {
  const date = parseTimestamp(job.timestamp || job.createdAt);
  
  // Combine parts and calcItems into unified rows
  const rows = [];
  let index = 1;

  if (job.parts && Array.isArray(job.parts) && job.parts.length > 0) {
    job.parts.forEach(p => {
      rows.push({
        num: (index++).toString().padStart(2, '0'),
        desc: p.name || 'Replacement Hardware Part',
        price: Number(p.sellingPrice || 0),
        qty: 1,
        total: Number(p.sellingPrice || 0)
      });
    });
  }

  if (job.calcItems && Array.isArray(job.calcItems) && job.calcItems.length > 0) {
    job.calcItems.filter(i => i.desc || Number(i.amount) > 0).forEach(item => {
      rows.push({
        num: (index++).toString().padStart(2, '0'),
        desc: item.desc || 'Diagnostic & Repair Service',
        price: Number(item.amount || 0),
        qty: 1,
        total: Number(item.amount || 0)
      });
    });
  }

  if (rows.length === 0) {
    rows.push({
      num: '01',
      desc: job.issue ? `Hardware Service: ${job.deviceType || 'PC'} (${job.issue})` : 'PC Diagnostics & Service',
      price: Number(job.finalTotal || job.estCost || 0),
      qty: 1,
      total: Number(job.finalTotal || job.estCost || 0)
    });
  }

  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const advance = Number(job.advancePayment || 0);
  const discount = Number(job.discount || 0);
  const balanceDue = Math.max(0, subTotal - advance - discount);
  const jobId = (job.id || 'NEW').slice(0, 6).toUpperCase();
  const titleText = isEstimate ? 'REPAIR ESTIMATE' : 'REPAIR INVOICE';
  const warrantyDays = Number(job.warrantyDays || 0);

  const itemsHtml = rows.map(r => `
    <tr>
      <td class="text-center" style="color: #64748b; font-size: 9px;">${r.num}</td>
      <td class="text-left" style="color: #1e293b; font-weight: 600;">${r.desc}</td>
      <td class="text-center" style="color: #475569;">Rs ${r.price.toFixed(2)}</td>
      <td class="text-center" style="color: #475569;">${r.qty}</td>
      <td class="text-right" style="color: #0f172a; font-weight: 700;">Rs ${r.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${titleText} - #${jobId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @page { 
          size: A5 portrait; 
          margin: 0; 
        }
        
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 10px 0; 
          background: #f1f5f9; 
          color: #0f172a;
          font-size: 10px;
          display: flex;
          justify-content: center;
        }
        
        .invoice-box {
          width: 148mm;
          min-height: 208mm;
          max-width: 148mm;
          margin: 0 auto;
          padding: 20px 22px 28px 22px;
          position: relative;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
        }
        
        .logo-section {
          width: 50%;
        }
        .logo-section img {
          height: 52px;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .logo-underline {
          width: 110px;
          height: 3px;
          background: linear-gradient(90deg, #1d4ed8, #0284c7);
          border-radius: 2px;
          margin-top: 2px;
        }

        .title-section {
          width: 50%;
          text-align: right;
        }
        .title-section h1 {
          color: #1d4ed8; 
          font-size: ${isEstimate ? '24px' : '26px'};
          font-weight: 900;
          margin: 0 0 6px 0;
          letter-spacing: 1.5px;
          line-height: 1;
        }
        
        .meta-grid {
          display: inline-grid;
          grid-template-columns: auto auto;
          gap: 2px 10px;
          text-align: right;
          font-size: 9px;
          color: #64748b;
        }
        .meta-grid .val {
          color: #0f172a;
          font-weight: 700;
        }

        /* Customer & Diagnostics */
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 15px;
        }
        
        .invoice-to {
          width: 48%;
        }
        .invoice-to-title {
          color: #0284c7;
          font-weight: 800;
          font-size: 9.5px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 3px;
          color: #0f172a;
        }
        .customer-details {
          color: #64748b;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .intro-text {
          width: 48%;
          font-size: 8.5px;
          color: #64748b;
          line-height: 1.4;
          background: #f8fafc;
          border-left: 2.5px solid #0284c7;
          padding: 6px 8px;
          border-radius: 2px;
        }
        .intro-text strong {
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        /* Table */
        .table-wrapper {
          margin-bottom: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: linear-gradient(90deg, #071739 0%, #1d4ed8 70%, #0284c7 100%);
        }
        th {
          color: white;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 7px 8px;
          letter-spacing: 0.5px;
        }
        th.bg-dark {
          background: #071739; 
        }
        
        tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }
        tbody td {
          padding: 8px 8px;
          font-size: 9.5px;
        }

        /* Footer Info */
        .bottom-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .totals-box {
          width: 48%;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3.5px 0;
          font-size: 9.5px;
          color: #64748b;
        }
        .totals-row .val { color: #0f172a; font-weight: 700; }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          background: linear-gradient(135deg, #071739 0%, #1d4ed8 100%);
          color: white;
          padding: 8px 10px;
          font-weight: 800;
          font-size: 13px;
          margin-top: 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* Absolute Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          gap: 15px;
        }
        .contact-col {
          width: 48%;
        }
        .thank-you {
          color: #1d4ed8;
          font-weight: 800;
          font-size: 11px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 5px;
          font-size: 8.5px;
          color: #64748b;
        }
        .icon-box {
          width: 18px;
          height: 18px;
          background: #0284c7;
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          shrink: 0;
        }

        .terms-col {
          width: 48%;
        }
        .terms-title {
          font-weight: 800;
          font-size: 10px;
          margin-bottom: 4px;
          color: #0f172a;
        }
        .terms-text {
          font-size: 8px;
          color: #64748b;
          line-height: 1.4;
        }
        
        /* Bottom Decoration */
        .bottom-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 16px;
          display: flex;
        }
        .dec-blue { width: 45%; background: #0284c7; }
        .dec-angle { 
          width: 0;
          height: 0;
          border-left: 16px solid #0284c7;
          border-bottom: 16px solid #071739;
        }
        .dec-black { flex: 1; background: #071739; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }

        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .invoice-box {
            box-shadow: none;
            width: 148mm;
            min-height: 208mm;
            padding: 16px 18px 24px 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        
        <div>
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <img src="${logo}" alt="Logo" />
              <div class="logo-underline"></div>
            </div>
            <div class="title-section">
              <h1>${titleText}</h1>
              <div class="meta-grid">
                <span>Job Number:</span> <span class="val">#${jobId}</span>
                <span>Device Type:</span> <span class="val">${job.deviceType || 'PC'}</span>
                <span>Job Date:</span> <span class="val">${format(date, 'MMM dd, yyyy')}</span>
                <span>Status:</span> <span class="val">${job.status || 'Active'}</span>
              </div>
            </div>
          </div>

          <!-- Customer & Device Diagnostics Details -->
          <div class="info-row">
            <div class="invoice-to">
              <div class="invoice-to-title">CUSTOMER DETAILS:</div>
              <div class="customer-name">${job.customerName || 'Customer'}</div>
              <div class="customer-details">
                ${job.whatsapp ? 'WhatsApp: ' + job.whatsapp + '<br>' : ''}
                Registered Client - DESH Digital Hub<br>
                Date: ${format(date, 'MMM dd, yyyy')}<br>
                Time: ${format(date, 'h:mm a')}
              </div>
            </div>
            <div class="intro-text">
              <strong>Device Diagnostics & Fault Info:</strong>
              Device: <b>${job.deviceType || 'Desktop PC'}</b>${job.serial ? ' | Serial: <b>' + job.serial + '</b>' : ''}<br>
              Fault: <b>${job.issue || 'Diagnostic check and servicing'}</b><br>
              ${warrantyDays > 0 ? 'Hardware Warranty: <b>' + warrantyDays + ' Days Valid</b>' : 'Service Warranty: Standard Bench Testing'}
            </div>
          </div>

          <!-- Services & Parts Table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 8%;">NO.</th>
                  <th class="text-left">HARDWARE PART / SERVICE DESCRIPTION</th>
                  <th class="text-center bg-dark" style="width: 20%;">PRICE</th>
                  <th class="text-center bg-dark" style="width: 12%;">QTY</th>
                  <th class="text-right bg-dark" style="width: 22%;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="bottom-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Services & Parts Total:</span>
                <span class="val">Rs ${subTotal.toFixed(2)}</span>
              </div>
              ${advance > 0 ? `
              <div class="totals-row">
                <span>Advance Paid:</span>
                <span class="val" style="color: #059669;">- Rs ${advance.toFixed(2)}</span>
              </div>
              ` : ''}
              ${discount > 0 ? `
              <div class="totals-row">
                <span>Discount Allowed:</span>
                <span class="val" style="color: #e11d48;">- Rs ${discount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="grand-total">
                <span>${isEstimate ? 'Balance Due:' : 'Net Payable Total:'}</span>
                <span>Rs ${(isEstimate ? balanceDue : (subTotal - discount)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <!-- Footer -->
          <div class="footer">
            <div class="contact-col">
              <div class="thank-you">Thank You For Your Business</div>
              
              <div class="contact-item">
                <div class="icon-box">📞</div>
                +94(71) 998 9000 / 077 123 4567
              </div>
              <div class="contact-item">
                <div class="icon-box">✉️</div>
                deshdigitalhub@gmail.com
              </div>
              <div class="contact-item">
                <div class="icon-box">📍</div>
                204/1, In Front Of Diwrumgala, Pitapahamuna, Melsiripura
              </div>
            </div>
            
            <div class="terms-col">
              <div class="terms-title">Terms & Warranty Conditions:</div>
              <div class="terms-text">
                ${warrantyDays > 0 ? `Hardware warranty valid for ${warrantyDays} days from invoice date.<br>` : ''}
                Parts once installed and sold are subject to manufacturer warranty terms.
                DESH Digital Hub is not responsible for software data loss; please maintain backups.
                Please present this invoice for warranty verification.
              </div>
            </div>
          </div>

          <!-- Bottom Graphic -->
          <div class="bottom-decoration">
            <div class="dec-blue"></div>
            <div class="dec-angle"></div>
            <div class="dec-black"></div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};
