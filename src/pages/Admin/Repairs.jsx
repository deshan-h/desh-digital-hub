import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { salesService, customerService } from '../../services/supabaseService';
import { format } from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { Search, Plus, Wrench, X, Check, Save, PlusCircle, Trash2, Calculator, Printer, Edit, Send, HelpCircle } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { RepairJobModal, RepairBillModal } from './RepairsComponents';

export default function Repairs({ user, fetchSales }) {
  const [repairs, setRepairs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isViewBillModalOpen, setIsViewBillModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [deleteModalJobId, setDeleteModalJobId] = useState(null);

  // Unified Job Form State
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [warrantyDays, setWarrantyDays] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [editAdvancePayment, setEditAdvancePayment] = useState(0);
  const [editFinalPayment, setEditFinalPayment] = useState(0);
  const [editSalutation, setEditSalutation] = useState('Mr.');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editDeviceType, setEditDeviceType] = useState('PC');
  const [editSerial, setEditSerial] = useState('');
  const [editIssue, setEditIssue] = useState('');
  const [editCalcItems, setEditCalcItems] = useState([{ desc: '', amount: '' }]);
  const [showCalc, setShowCalc] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: repData, error } = await supabase
        .from('view_repairs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching repairs:", error);

      const mappedRepairs = (repData || []).map(r => {
        const extra = (r.parts_used && typeof r.parts_used === 'object' && !Array.isArray(r.parts_used))
          ? r.parts_used
          : { parts: r.parts_used || [] };

        return {
          id: r.id,
          customerId: r.customer_id,
          customerName: r.customer_name || 'Repair Customer',
          whatsapp: r.phone || '',
          deviceType: r.device_model || 'PC',
          issue: r.issue || '',
          status: r.status || 'Pending',
          isPaid: Boolean(r.is_paid),
          createdAt: r.created_at,
          timestamp: r.created_at,
          ...extra
        };
      });

      setRepairs(mappedRepairs);
      setInventory([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    setDeleteModalJobId(id);
  };

  const confirmDeleteJob = async () => {
    if (!deleteModalJobId) return;
    try {
      await supabase.from('repairs').delete().eq('id', deleteModalJobId);
      fetchData();
      notify.success("Job deleted successfully.");
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete job.");
    } finally {
      setDeleteModalJobId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openJobModal = (repair = null) => {
    setSelectedRepair(repair);
    if (repair) {
      let cName = repair.customerName || '';
      let sal = 'Mr.';
      const prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Rev.', 'Dr.', 'Hon.'];
      for (let p of prefixes) {
        if (cName.startsWith(p + ' ')) {
          sal = p;
          cName = cName.substring(p.length + 1).trim();
          break;
        }
      }
      setEditSalutation(sal);
      setEditCustomerName(cName);
      setEditWhatsapp(repair.whatsapp || '');
      setEditDeviceType(repair.deviceType || 'PC');
      setEditSerial(repair.serial || '');
      setEditIssue(repair.issue || '');
      setModalStatus(repair.status || 'Pending');
      setWarrantyDays(repair.warrantyDays || 0);
      setDiscount(repair.discount || 0);
      setEditAdvancePayment(repair.advancePayment || 0);
      setEditFinalPayment(repair.finalPayment || 0);
      setEditCalcItems(repair.calcItems && repair.calcItems.length > 0 ? repair.calcItems : [{ desc: '', amount: '' }]);
    } else {
      setEditSalutation('Mr.');
      setEditCustomerName('');
      setEditWhatsapp('');
      setEditDeviceType('PC');
      setEditSerial('');
      setEditIssue('');
      setModalStatus('Pending');
      setWarrantyDays(0);
      setDiscount(0);
      setEditAdvancePayment(0);
      setEditFinalPayment(0);
      setEditCalcItems([{ desc: '', amount: '' }]);
    }
    setShowCalc(false);
    setIsJobModalOpen(true);
  };

  const hasPendingBalanceToComplete = () => {
    return modalStatus === 'Paid' && currentFinalTotal > 0;
  };

  const handleSaveJob = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    if (!editCustomerName || !editIssue) return notify.error('Customer Name and Issue are required.');
    
    if (selectedRepair && hasPendingBalanceToComplete()) {
      notify.error("Please mark the pending balance as paid before saving.");
      return;
    }

    const jobData = {
      customerName: `${editSalutation} ${editCustomerName.trim()}`,
      whatsapp: editWhatsapp,
      deviceType: editDeviceType,
      serial: editSerial,
      issue: editIssue,
      calcItems: editCalcItems,
      warrantyDays: Number(warrantyDays) || 0,
      discount: Number(discount) || 0,
      advancePayment: Number(editAdvancePayment) || 0,
      finalPayment: Number(editFinalPayment) || 0,
      estCost: editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    };

    try {
      let customerId = selectedRepair?.customerId || null;
      if (!customerId && jobData.customerName) {
        customerId = await customerService.findOrCreateCustomerByName(jobData.customerName, jobData.whatsapp);
      }

      if (selectedRepair) {
        jobData.status = modalStatus;

        if (modalStatus === 'Paid' && selectedRepair.status !== 'Paid') {
          const partsTotal = (selectedRepair.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
          const calcItemsTotal = editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          const calcCostTotal = editCalcItems.reduce((sum, item) => sum + Number(item.buyingPrice || 0), 0);
          
          const buyingTotal = (selectedRepair.parts || []).reduce((sum, p) => sum + p.buyingPrice, 0) + calcCostTotal;
          const totalJobAmount = partsTotal + calcItemsTotal - Number(discount);
          
          jobData.finalTotal = totalJobAmount;
          jobData.profit = totalJobAmount - buyingTotal;

          let description = `Repair Payment: ${jobData.customerName} - ${jobData.deviceType} `;
          if ((selectedRepair.parts || []).length > 0) {
            description += `| Parts: ${(selectedRepair.parts || []).map(p => p.name).join(', ')} `;
          }
          if (editCalcItems.length > 0) {
            const calcDescs = editCalcItems.filter(i => i.desc).map(i => i.desc);
            if (calcDescs.length > 0) {
              description += `| Services: ${calcDescs.join(', ')} `;
            }
          }

          await salesService.createSale({
            amount: totalJobAmount,
            description,
            customerName: jobData.customerName || 'Repair Customer',
            customerPhone: jobData.whatsapp || '',
            userId: user?.id || user?.email || 'system'
          });
        }

        const repairPayload = {
          customer_id: customerId,
          device_model: jobData.deviceType || 'PC',
          issue: jobData.issue || '',
          cost: Number(jobData.finalTotal || jobData.estCost || 0),
          estimated_cost: Number(jobData.estCost || 0),
          status: jobData.status,
          is_paid: jobData.status === 'Paid',
          parts_used: {
            parts: selectedRepair.parts || [],
            calcItems: jobData.calcItems || [],
            warrantyDays: jobData.warrantyDays,
            advancePayment: jobData.advancePayment,
            finalPayment: jobData.finalPayment,
            serial: jobData.serial,
            deviceType: jobData.deviceType,
            salutation: editSalutation,
            profit: jobData.profit,
            finalTotal: jobData.finalTotal
          }
        };

        await supabase.from('repairs').update(repairPayload).eq('id', selectedRepair.id);
      } else {
        jobData.status = 'Pending';
        jobData.parts = [];
        jobData.laborCharge = 0;
        jobData.finalTotal = 0;

        const repairPayload = {
          customer_id: customerId,
          device_model: jobData.deviceType || 'PC',
          issue: jobData.issue || '',
          cost: 0,
          estimated_cost: Number(jobData.estCost || 0),
          status: 'Pending',
          is_paid: false,
          parts_used: {
            parts: [],
            calcItems: jobData.calcItems || [],
            warrantyDays: jobData.warrantyDays,
            advancePayment: jobData.advancePayment,
            finalPayment: jobData.finalPayment,
            serial: jobData.serial,
            deviceType: jobData.deviceType,
            salutation: editSalutation
          }
        };
        
        const { data: createdRepair, error: createErr } = await supabase.from('repairs').insert(repairPayload).select().single();
        if (createErr) throw createErr;
        jobData.id = createdRepair.id;
        
        if (shouldPrint) {
          printEstimate(jobData);
        }
      }

      setIsJobModalOpen(false);
      fetchData();
      if (fetchSales) fetchSales();
      notify.success(`Job ${selectedRepair ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error(err);
      notify.error('Error saving job');
    }
  };

  const printEstimate = (jobData) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Repair Estimate</title>
        <style>
          @page { size: A5 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; font-size: 14px; margin: 0; padding: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { border: 1px solid #000; padding: 10px; width: 48%; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; border: 1px solid #000; text-align: left; }
          th { background-color: #f3f4f6; }
          .right { text-align: right; }
          .totals-container { display: flex; justify-content: flex-end; }
          .totals-table { width: 300px; border: none; }
          .totals-table td { border: none; padding: 4px 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${logo}" alt="Logo" style="height: 60px; margin-bottom: 5px; object-fit: contain;" />
            <div style="font-weight: bold; font-size: 16px;">DESH Digital Hub</div>
            <div>204/1, Pitapahamuna, Melsiripura</div>
            <div>Tel: 071 998 9000</div>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">Repair Estimate</h1>
            <div style="margin-top: 10px;">
              <b>Job No:</b> #${jobData.id ? jobData.id.slice(0, 6).toUpperCase() : 'NEW'}<br/>
              <b>Date:</b> ${new Date().toLocaleString()}
            </div>
          </div>
        </div>

        <div class="info-row">
          <div class="info-box">
            <b>Customer Details:</b><br/>
            ${jobData.customerName}<br/>
            ${jobData.whatsapp ? `WhatsApp: ${jobData.whatsapp}` : ''}
          </div>
          <div class="info-box">
            <b>Device Details:</b><br/>
            Type: ${jobData.deviceType}<br/>
            Issue: ${jobData.issue}
          </div>
        </div>

        ${jobData.calcItems && jobData.calcItems.length > 0 && jobData.calcItems.some(i => i.desc) ? `
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="right" style="width: 150px;">Amount (Rs)</th>
            </tr>
          </thead>
          <tbody>
            ${jobData.calcItems.filter(i => i.desc).map(p => `
              <tr>
                <td>${p.desc}</td>
                <td class="right">${Number(p.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #000; border-radius: 5px;">
          <b>Services:</b><br/>
          N/A
        </div>
        `}
        
        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td>EST. TOTAL:</td>
              <td class="right"><b>Rs ${Number(jobData.estCost || 0).toFixed(2)}</b></td>
            </tr>
            ${Number(jobData.advancePayment) > 0 ? `
            <tr>
              <td>ADVANCE PAID:</td>
              <td class="right">- Rs ${Number(jobData.advancePayment).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${Number(jobData.discount) > 0 ? `
            <tr>
              <td>DISCOUNT:</td>
              <td class="right">- Rs ${Number(jobData.discount).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #000;">
              <td style="padding-top: 8px;">BALANCE:</td>
              <td class="right" style="padding-top: 8px;">Rs ${Math.max(0, Number(jobData.estCost || 0) - Number(jobData.advancePayment || 0) - Number(jobData.discount || 0)).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          *This is only an estimate and prices may vary depending on the actual repairs required.*<br/>
          Thank you for your business!
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };





  const printFinalBill = (job) => {
    const partsTotal = (job.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
    const calcTotal = (job.calcItems || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const disc = Number(job.discount || 0);
    const subTotal = partsTotal + calcTotal;
    const finalTotal = subTotal - disc;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Final Bill - DESH Digital Hub</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
          @page { size: A4 portrait; margin: 10mm; }
          body { 
            font-family: 'Montserrat', sans-serif; 
            color: #1a1a1a; 
            font-size: 9px; 
            margin: 0; 
            padding: 0; 
            background: #fff; 
          }
          .container { max-width: 800px; margin: 0 auto; }
          
          /* Header */
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px;
          }
          .invoice-title { 
            font-size: 28px; 
            font-weight: 800; 
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #262626;
            margin: 0;
          }
          .logo-container {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .logo-container img { 
            height: 100px; 
            object-fit: contain;
            margin-bottom: 5px;
          }

          /* Info Section */
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .issued-to h4, .invoice-details h4 {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #525252;
            margin: 0 0 6px 0;
            font-weight: 700;
          }
          .issued-to .customer-name {
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .issued-to .customer-details {
            color: #525252;
            line-height: 1.3;
          }
          .invoice-details table {
            border: none;
            margin: 0;
            width: auto;
          }
          .invoice-details td {
            padding: 2px 0 2px 20px;
            border: none;
            font-size: 9px;
          }
          .invoice-details td.label {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #525252;
            font-size: 9px;
            padding-left: 0;
          }

          /* Main Table */
          .table-container {
            margin-bottom: 20px;
          }
          table.main-table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          table.main-table th { 
            font-size: 10px; 
            text-transform: uppercase; 
            letter-spacing: 1.5px;
            font-weight: 700;
            color: #1a1a1a;
            padding: 6px 10px;
            border-top: 1px solid #1a1a1a;
            border-bottom: 1px solid #1a1a1a;
            text-align: left;
          }
          table.main-table th.center, table.main-table td.center {
            text-align: center;
          }
          table.main-table td { 
            padding: 6px 10px; 
            border-bottom: 1px solid #e5e5e5;
            color: #404040;
            font-weight: 500;
            font-size: 10px;
          }
          table.main-table th.right, table.main-table td.right { 
            text-align: right; 
          }

          /* Totals */
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 10px;
          }
          .totals-table { 
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td { 
            padding: 6px 10px; 
            border: none;
            font-weight: 600;
            color: #525252;
            font-size: 8px;
          }
          .totals-table td.right {
            text-align: right;
            color: #1a1a1a;
          }
          .totals-table tr.total-row td, .totals-table tr.total-row td.right {
            font-weight: 800;
            font-size: 16px;
            color: #dc2626;
            padding-top: 8px;
          }

          /* Bottom Section */
          .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .payment-info h4 {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #1a1a1a;
            margin: 0 0 10px 0;
            font-weight: 700;
          }
          .payment-info p {
            margin: 0 0 4px 0;
            color: #525252;
            font-weight: 500;
          }
          /* Footer Note */
          .footer-note {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #737373;
          }
          .warranty {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="logo-container">
              <img src="${logo}" alt="Logo" />
            </div>
          </div>

          <div class="info-section">
            <div class="issued-to">
              <h4>Issued To:</h4>
              <div class="customer-name">${job.customerName}</div>
              <div class="customer-details">
                ${job.whatsapp ? `Tel: ${job.whatsapp}<br/>` : ''}
                Device: ${job.deviceType}<br/>
                Issue: ${job.issue}<br/>
                ${job.warrantyDays ? `<b>Warranty:</b> ${job.warrantyDays} Days` : ''}
              </div>
            </div>
            <div class="invoice-details">
              <table>
                <tr>
                  <td class="label">Invoice No:</td>
                  <td class="right">${job.id ? job.id.slice(0, 6).toUpperCase() : 'NEW'}</td>
                </tr>
                <tr>
                  <td class="label">Date:</td>
                  <td class="right">${new Date().toLocaleDateString('en-GB')}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="table-container">
            <table class="main-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="center" style="width: 40px;">Qty</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(job.parts || []).map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td class="center">${p.qty || 1}</td>
                    <td class="right">Rs ${p.sellingPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
                ${(job.calcItems || []).filter(i => i.desc).map(p => `
                  <tr>
                    <td>${p.desc}</td>
                    <td class="center">1</td>
                    <td class="right">Rs ${Number(p.amount || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>SUBTOTAL</td>
                <td class="right">Rs ${subTotal.toFixed(2)}</td>
              </tr>
              ${disc > 0 ? `
              <tr>
                <td>DISCOUNT</td>
                <td class="right">- Rs ${disc.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td>TOTAL</td>
                <td class="right">Rs ${finalTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="bottom-section">
            <div class="payment-info">
              <h4>Contact Info:</h4>
              <p>204/1, Pitapahamuna, Melsiripura</p>
              <p>Tel: 071 998 9000</p>
              <p>Email: deshdigitalhub@gmail.com</p>
            </div>
          </div>

          <div class="footer-note">
            ${job.warrantyDays ? `<div class="warranty">Hardware Warranty Valid for ${job.warrantyDays} Days from Date of Invoice</div>` : ''}
            <div>Goods once sold will not be taken back. Warranty is subject to manufacturer terms.</div>
            <div style="margin-top: 10px; font-weight: 600;">Thank you for your business!</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintBill = () => {
    if (!selectedRepair) return;
    printFinalBill({
      ...selectedRepair,
      parts: usedParts,
      laborCharge,
      discount
    });
  };

  const viewBill = (job) => {
    setViewingJob(job);
    setIsViewBillModalOpen(true);
  };

  const partsTotal = (selectedRepair?.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
  const calcItemsTotal = editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const currentFinalTotal = partsTotal + calcItemsTotal - Number(discount) - Number(editAdvancePayment) - Number(editFinalPayment);

  const commonServices = [
    { name: 'Computer Formatting', price: 1500 },
    { name: 'Software Installation', price: 500 },
    { name: 'Driver Updating', price: 500 },
    { name: 'PC/Laptop service', price: 500 }
  ];

  const handleQuickAdd = (service) => {
    let newItems = [...editCalcItems];
    if (newItems.length === 1 && newItems[0].desc === '' && !newItems[0].amount) {
      newItems = [{ desc: service.name, amount: service.price }];
    } else {
      newItems.push({ desc: service.name, amount: service.price });
    }
    setEditCalcItems(newItems);
  };

  return (
    <div className="p-4 space-y-4 w-full relative z-10 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2 md:px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <Wrench className="w-8 h-8 text-orange-400" /> PC REPAIRS
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Manage active and past repair jobs.
            </div>
          </div>
        </div>
        <button
          onClick={() => openJobModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Repair Job
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-0">
        <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-200">Active & Past Jobs</h3>
          <button onClick={fetchData} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">Refresh</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-4 font-semibold">Job ID</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Customer Name</th>
                <th className="px-4 py-4 font-semibold">WhatsApp</th>
                <th className="px-4 py-4 font-semibold">Device</th>
                <th className="px-4 py-4 font-semibold">Issue</th>
                <th className="px-4 py-4 font-semibold text-right">Est. Cost</th>
                <th className="px-4 py-4 font-semibold text-right">Advance Paid</th>
                <th className="px-4 py-4 font-semibold text-right">Discount</th>
                <th className="px-4 py-4 font-semibold text-right">Balance</th>
                <th className="px-4 py-4 font-semibold text-center">Status</th>
                {user?.email === 'admin@desh.lk' && (
                  <th className="px-4 py-4 font-semibold text-right text-blue-400">Profit</th>
                )}
                <th className="px-4 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="10" className="px-6 py-8 text-center text-slate-500">Loading jobs...</td></tr>
              ) : repairs.length === 0 ? (
                <tr><td colSpan="10" className="px-6 py-8 text-center text-slate-500">No repair jobs found.</td></tr>
              ) : (
                repairs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-4 text-emerald-400 font-mono font-bold text-sm whitespace-nowrap align-top">
                      {job.status === 'Paid' ? (
                        <span>#{job.id.slice(0, 6).toUpperCase()}</span>
                      ) : (
                        <button onClick={() => viewBill(job)} className="hover:underline hover:text-emerald-300 transition-colors" title="View Bill">
                          #{job.id.slice(0, 6).toUpperCase()}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap align-top">
                      {job.createdAt ? format(parseTimestamp(job.createdAt), 'MMM dd, p') : '...'}
                    </td>
                    <td className="px-4 py-4 text-slate-200 font-medium text-sm align-top">
                      {job.customerName}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm whitespace-nowrap align-top">
                      {job.whatsapp || '-'}
                    </td>
                    <td className="px-4 py-4 text-slate-300 font-semibold text-sm whitespace-nowrap align-top">
                      {job.deviceType}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm align-top leading-relaxed min-w-[200px]">
                      {job.issue}
                    </td>
                    <td className="px-4 py-4 text-emerald-400/80 font-medium text-sm text-right whitespace-nowrap align-top">
                      {job.estCost ? `Rs ${job.estCost.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-emerald-400 font-semibold text-sm text-right whitespace-nowrap align-top">
                      {job.advancePayment ? `Rs ${job.advancePayment.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-red-400 font-semibold text-sm text-right whitespace-nowrap align-top">
                      {job.discount ? `Rs ${job.discount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-orange-400 font-bold text-sm text-right whitespace-nowrap align-top">
                      {((job.estCost || 0) - (job.advancePayment || 0) - (job.discount || 0)) > 0 ? `Rs ${((job.estCost || 0) - (job.advancePayment || 0) - (job.discount || 0)).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap align-top">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${job.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        job.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          job.status === 'Paid' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {job.status}
                      </span>
                    </td>
                    {user?.email === 'admin@desh.lk' && (
                      <td className="px-4 py-4 text-blue-400 font-bold text-sm text-right whitespace-nowrap align-top">
                        {(() => {
                           if (job.profit !== undefined) return `Rs ${job.profit.toFixed(2)}`;
                           const pTotal = (job.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
                           const cTotal = (job.calcItems || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                           const pCost = (job.parts || []).reduce((sum, p) => sum + p.buyingPrice, 0);
                           const cCost = (job.calcItems || []).reduce((sum, i) => sum + Number(i.buyingPrice || 0), 0);
                           let estimatedRevenue = (pTotal + cTotal) > 0 ? (pTotal + cTotal) : (job.estCost || 0);
                           let totalCost = pCost + cCost;
                           let profit = estimatedRevenue - totalCost - Number(job.discount || 0);
                           return `Rs ${profit.toFixed(2)}`;
                        })()}
                      </td>
                    )}
                    <td className="px-4 py-4 text-center whitespace-nowrap align-top">
                      <div className="flex items-center justify-center gap-2">
                        {job.status === 'Paid' ? (
                          <button
                            onClick={() => printFinalBill(job)}
                            className="text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 p-2 rounded-lg transition-all"
                            title="Print Final Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openJobModal(job)}
                            className="text-slate-400 hover:text-emerald-400 bg-slate-800/50 hover:bg-emerald-500/10 p-2 rounded-lg transition-all"
                            title="Update Job"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {user?.email === 'admin@desh.lk' && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Job Modal */}
      <RepairJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        selectedRepair={selectedRepair}
        handleSaveJob={handleSaveJob}
        editSalutation={editSalutation}
        setEditSalutation={setEditSalutation}
        editCustomerName={editCustomerName}
        setEditCustomerName={setEditCustomerName}
        editWhatsapp={editWhatsapp}
        setEditWhatsapp={setEditWhatsapp}
        editDeviceType={editDeviceType}
        setEditDeviceType={setEditDeviceType}
        editSerial={editSerial}
        setEditSerial={setEditSerial}
        editIssue={editIssue}
        setEditIssue={setEditIssue}
        modalStatus={modalStatus}
        setModalStatus={setModalStatus}
        warrantyDays={warrantyDays}
        setWarrantyDays={setWarrantyDays}
        discount={discount}
        setDiscount={setDiscount}
        editAdvancePayment={editAdvancePayment}
        setEditAdvancePayment={setEditAdvancePayment}
        editFinalPayment={editFinalPayment}
        setEditFinalPayment={setEditFinalPayment}
        editCalcItems={editCalcItems}
        setEditCalcItems={setEditCalcItems}
        handleQuickAdd={handleQuickAdd}
        partsTotal={partsTotal}
        calcItemsTotal={calcItemsTotal}
        currentFinalTotal={currentFinalTotal}
        user={user}
        printEstimate={printEstimate}
        printFinalBill={printFinalBill}
        hasPendingBalanceToComplete={hasPendingBalanceToComplete}
      />

      {/* View Bill Modal */}
      <RepairBillModal
        isOpen={isViewBillModalOpen}
        onClose={() => setIsViewBillModalOpen(false)}
        viewingJob={viewingJob}
        printEstimate={printEstimate}
        printFinalBill={printFinalBill}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deleteModalJobId} 
        onClose={() => setDeleteModalJobId(null)} 
        onConfirm={confirmDeleteJob}
        title="Delete Job?"
        message="Are you sure you want to delete this repair job? This action cannot be undone."
      />
    </div>
  );
}
