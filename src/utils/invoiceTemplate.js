import { format } from 'date-fns';
import logo from '../assets/logo.webp';

const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

export const generateInvoiceHtml = (sale) => {
  const date = parseTimestamp(sale.timestamp);
  const items = sale.cartItems || [];
  
  const itemsHtml = items.map((item, index) => `
    <tr>
      <td class="text-center" style="color: #64748b; font-size: 11px;">${(index + 1).toString().padStart(2, '0')}</td>
      <td class="text-left" style="color: #334155; font-weight: 500;">${item.name}</td>
      <td class="text-center" style="color: #64748b;">Rs ${Number(item.price).toFixed(2)}</td>
      <td class="text-center" style="color: #64748b;">${item.qty}</td>
      <td class="text-right" style="color: #0f172a; font-weight: 600;">Rs ${(Number(item.price) * Number(item.qty)).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - #${sale.id.slice(0,6).toUpperCase()}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @page { size: A4; margin: 0; }
        
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 0; 
          background: #e2e8f0; /* Gray background outside */
          color: #0f172a;
          font-size: 12px;
        }
        
        .invoice-box {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 40px 50px;
          position: relative;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .logo-section {
          width: 50%;
        }
        .logo-section img {
          height: 120px;
          object-fit: contain;
          margin-bottom: 10px;
        }
        .logo-underline {
          width: 150px;
          height: 3px;
          background-color: #0f172a;
          margin-top: 5px;
        }

        .title-section {
          width: 50%;
          text-align: right;
        }
        .title-section h1 {
          color: #10b981; 
          font-size: 48px;
          font-weight: 900;
          margin: 0 0 15px 0;
          letter-spacing: 2px;
        }
        
        .meta-grid {
          display: inline-grid;
          grid-template-columns: auto auto;
          gap: 5px 15px;
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .meta-grid .val {
          color: #0f172a;
          font-weight: 600;
        }

        /* Invoice To & Intro */
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .invoice-to {
          width: 45%;
        }
        .invoice-to-title {
          color: #10b981;
          font-weight: 700;
          font-size: 12px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .customer-name {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #0f172a;
        }
        .customer-details {
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .intro-text {
          width: 50%;
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
        }
        .intro-text strong {
          color: #0f172a;
          display: block;
          margin-bottom: 8px;
        }

        /* Table */
        .table-wrapper {
          margin-bottom: 40px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: #10b981; 
        }
        th {
          color: white;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 12px 10px;
        }
        th.bg-dark {
          background: #0f172a; 
        }
        
        tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }
        tbody td {
          padding: 15px 10px;
          font-size: 12px;
        }

        /* Footer Info */
        .bottom-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .totals-box {
          width: 35%;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
          color: #64748b;
        }
        .totals-row .val { color: #0f172a; font-weight: 600; }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          background: #10b981;
          color: white;
          padding: 12px 15px;
          font-weight: 700;
          font-size: 16px;
          margin-top: 10px;
          border-radius: 4px;
        }

        /* Signatures */
        .signature-section {
          display: flex;
          justify-content: center;
          margin: 50px 0;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-bottom: 1px solid #cbd5e1;
          margin-bottom: 10px;
          height: 50px;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }
        .signature-title {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }

        /* Absolute Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
        }
        .contact-col {
          width: 45%;
        }
        .thank-you {
          color: #10b981;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 11px;
          color: #64748b;
        }
        .icon-box {
          width: 24px;
          height: 24px;
          background: #10b981;
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .terms-col {
          width: 50%;
        }
        .terms-title {
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 10px;
          color: #0f172a;
        }
        .terms-text {
          font-size: 10px;
          color: #64748b;
          line-height: 1.6;
        }
        
        /* Bottom Decoration */
        .bottom-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35px;
          display: flex;
        }
        .dec-blue { width: 40%; background: #10b981; }
        .dec-angle { 
          width: 0;
          height: 0;
          border-left: 35px solid #10b981;
          border-bottom: 35px solid #0f172a;
        }
        .dec-black { flex: 1; background: #0f172a; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        
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
              <span>Invoice Date:</span> <span class="val">${format(date, 'MMMM dd, yyyy')}</span>
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
            <strong>Dear Client,</strong>
            Thank you for choosing DESH Digital Hub. This document serves as a record of your transaction. If you have any questions regarding this invoice, please feel free to contact us using the details provided below.
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 10%;">NO.</th>
                <th class="text-left">PRODUCT DESCRIPTION</th>
                <th class="text-center bg-dark" style="width: 15%;">PRICE</th>
                <th class="text-center bg-dark" style="width: 15%;">QUANTITY</th>
                <th class="text-right bg-dark" style="width: 20%;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || `
                <tr>
                  <td class="text-center" style="color: #64748b;">01</td>
                  <td class="text-left" style="color: #334155; font-weight: 500;">${sale.description}</td>
                  <td class="text-center" style="color: #64748b;">-</td>
                  <td class="text-center" style="color: #64748b;">-</td>
                  <td class="text-right" style="color: #0f172a; font-weight: 600;">Rs ${Number(sale.amount).toFixed(2)}</td>
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
              <span>Total:</span>
              <span>Rs ${Number(sale.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>


        <!-- Footer -->
        <div class="footer">
          <div class="contact-col">
            <div class="thank-you">Thank You For Your Business</div>
            
            <div class="contact-item">
              <div class="icon-box">📞</div>
              +94(71) 998 9000
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
              Goods sold are not returnable or exchangeable unless defective.
              For PC repairs and services, a warranty period applies as specified.
              Please retain this invoice for any future warranty claims or inquiries.
              We appreciate your trust in DESH Digital Hub.
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
    </body>
    </html>
  `;
};
