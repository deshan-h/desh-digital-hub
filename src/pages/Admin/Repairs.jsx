import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { Search, Plus, Wrench, X, Check, Save, PlusCircle, Trash2, Calculator, Printer, Edit, Send, HelpCircle } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

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
      const repQuery = query(collection(db, 'repairs'), orderBy('createdAt', 'desc'));
      const repSnap = await getDocs(repQuery);
      setRepairs(repSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const invSnap = await getDocs(collection(db, 'inventory'));
      setInventory(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      await deleteDoc(doc(db, 'repairs', deleteModalJobId));
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
      estCost: editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      updatedAt: serverTimestamp()
    };

    try {
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
          jobData.completedAt = serverTimestamp();

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

          await addDoc(collection(db, 'daily_sales'), {
            amount: totalJobAmount,
            cost: buyingTotal,
            description,
            isRepair: true,
            repairId: selectedRepair.id,
            timestamp: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email,
            customerName: jobData.customerName || 'Repair Customer'
          });
        }

        await updateDoc(doc(db, 'repairs', selectedRepair.id), jobData);
      } else {
        jobData.status = 'Pending';
        jobData.createdAt = serverTimestamp();
        jobData.createdBy = user.email;
        jobData.parts = [];
        jobData.laborCharge = 0;
        jobData.finalTotal = 0;
        
        const docRef = await addDoc(collection(db, 'repairs'), jobData);
        jobData.id = docRef.id;
        
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
            <Wrench className="w-8 h-8 text-emerald-500" /> PC REPAIRS
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
                      {job.createdAt ? format(job.createdAt.toDate(), 'MMM dd, p') : '...'}
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
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden slide-in-from-bottom-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {selectedRepair ? (
                  <>Update Repair: {selectedRepair.customerName}</>
                ) : (
                  <><Wrench className="w-5 h-5 text-emerald-500" /> New PC Repair Job</>
                )}
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Basic Details Edit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Customer Name</label>
                  <div className="flex gap-2">
                    <select 
                      value={editSalutation} 
                      onChange={e => setEditSalutation(e.target.value)} 
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm w-24"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Rev.">Rev.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Hon.">Hon.</option>
                    </select>
                    <input type="text" value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">WhatsApp Number</label>
                  <input type="text" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Device Type</label>
                  <select value={editDeviceType} onChange={e => setEditDeviceType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm">
                    <option value="PC">Desktop PC</option>
                    <option value="Laptop">Laptop</option>
                    <option value="MacBook">MacBook</option>
                    <option value="Printer">Printer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Serial / Model</label>
                  <input type="text" value={editSerial} onChange={e => setEditSerial(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Issue Description</label>
                  <input type="text" value={editIssue} onChange={e => setEditIssue(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-emerald-400">Estimate / Bill Items</h4>
                  <div className="flex gap-2">
                    {commonServices.map(s => (
                      <button
                        type="button"
                        key={s.name}
                        onClick={() => handleQuickAdd(s)}
                        className="bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold py-1 px-2 rounded-lg transition-all"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-2 text-slate-400">Item / Repair</th>
                      {user?.email === 'admin@desh.lk' && (
                        <th className="py-2 text-slate-400 text-right">Real Price (Buy)</th>
                      )}
                      <th className="py-2 text-slate-400 text-right">Selling Price</th>
                      {user?.email === 'admin@desh.lk' && (
                        <th className="py-2 text-slate-400 text-right w-24">Profit</th>
                      )}
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editCalcItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 last:border-0">
                        <td className="py-2 pr-2">
                          <input type="text" value={item.desc} onChange={e => {
                            const newItems = [...editCalcItems];
                            newItems[idx].desc = e.target.value;
                            setEditCalcItems(newItems);
                          }} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500" placeholder="Description" />
                        </td>
                        {user?.email === 'admin@desh.lk' && (
                          <td className="py-2 px-2 w-28">
                            <input type="number" value={item.buyingPrice || ''} onChange={e => {
                              const newItems = [...editCalcItems];
                              newItems[idx].buyingPrice = Number(e.target.value);
                              setEditCalcItems(newItems);
                            }} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-right focus:outline-none focus:border-emerald-500" placeholder="Cost" />
                          </td>
                        )}
                        <td className="py-2 pl-2 w-32">
                          <input type="number" value={item.amount || ''} onChange={e => {
                            const newItems = [...editCalcItems];
                            newItems[idx].amount = Number(e.target.value);
                            setEditCalcItems(newItems);
                          }} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-medium text-right focus:outline-none focus:border-emerald-500" placeholder="Selling" />
                        </td>
                        {user?.email === 'admin@desh.lk' && (
                          <td className="py-2 pl-2 w-24 text-right text-blue-400 font-medium pt-3">
                            {((Number(item.amount) || 0) - (Number(item.buyingPrice) || 0)).toFixed(2)}
                          </td>
                        )}
                        <td className="py-2 pl-2 text-right w-8">
                          <button onClick={() => setEditCalcItems(editCalcItems.filter((_, i) => i !== idx))} className="text-red-400/50 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-3">
                  <button onClick={() => setEditCalcItems([...editCalcItems, { desc: '', amount: '', buyingPrice: '' }])} className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                  {/* Profit moved to the bottom */}
                </div>
              </div>
              {selectedRepair && (
                <div className="flex gap-4 items-end mb-6">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Current Status</label>
                    <select
                      value={modalStatus}
                      onChange={e => setModalStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  {modalStatus === 'Paid' && currentFinalTotal > 0 && (
                    <div className="flex-1 bg-orange-950/30 border border-orange-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Pending Balance</div>
                        <div className="text-lg font-black text-slate-200">Rs {currentFinalTotal.toFixed(2)}</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEditFinalPayment(prev => Number(prev || 0) + currentFinalTotal)}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Paid
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="border-t border-slate-800 pt-6 grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Warranty (Days)</label>
                  <input type="number" value={warrantyDays} onChange={e => setWarrantyDays(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-bold focus:outline-none focus:border-emerald-500 text-right" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Advance Paid (Rs)</label>
                  <input type="number" value={editAdvancePayment} onChange={e => setEditAdvancePayment(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Discount (Rs)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-red-400 font-bold focus:outline-none focus:border-red-500 text-right" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Balance Amount</span>
                <span className="text-3xl font-black text-emerald-400 leading-none mb-1">Rs {currentFinalTotal.toFixed(2)}</span>
                {user?.email === 'admin@desh.lk' && (
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 w-max inline-block">
                    Profit: Rs {(editCalcItems.reduce((sum, item) => sum + ((Number(item.amount) || 0) - (Number(item.buyingPrice) || 0)), 0) - (Number(discount) || 0)).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {(modalStatus === 'Completed' || modalStatus === 'Paid') && selectedRepair && (
                  <>
                    <button
                      onClick={() => {
                        if (hasPendingBalanceToComplete()) {
                          notify.error("Please mark the pending balance as paid before printing.");
                          return;
                        }
                        const tempJob = { ...selectedRepair, status: modalStatus, calcItems: editCalcItems, advancePayment: editAdvancePayment, finalPayment: editFinalPayment, discount: discount, finalTotal: currentFinalTotal, warrantyDays: Number(warrantyDays) || 0 };
                        printFinalBill(tempJob);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 border border-slate-700"
                      title="Print Bill"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    {selectedRepair.whatsapp && (
                      <button
                        onClick={() => {
                          if (hasPendingBalanceToComplete()) {
                            notify.error("Please mark the pending balance as paid before sending WhatsApp message.");
                            return;
                          }
                          const tempJob = { ...selectedRepair, status: modalStatus, calcItems: editCalcItems, advancePayment: editAdvancePayment, finalPayment: editFinalPayment, discount: discount, finalTotal: currentFinalTotal, warrantyDays: Number(warrantyDays) || 0 };
                          const advance = Number(tempJob.advancePayment || 0);
                          const finalPmt = Number(tempJob.finalPayment || 0);
                          const disc = Number(tempJob.discount || 0);
                          const itemsText = [];
                          if (tempJob.parts && tempJob.parts.length > 0) {
                            tempJob.parts.forEach(p => itemsText.push(`- ${p.name}: Rs ${p.sellingPrice.toFixed(2)}`));
                          }
                          if (tempJob.calcItems && tempJob.calcItems.length > 0) {
                            tempJob.calcItems.filter(i => i.desc).forEach(p => itemsText.push(`- ${p.desc}: Rs ${Number(p.amount || 0).toFixed(2)}`));
                          }
                          const itemsString = itemsText.length > 0 ? `\n\nServices & Items:\n${itemsText.join('\n')}\n` : '\n';
                          let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
                          const msg = `Hello ${tempJob.customerName},\n\nYour repair job (Job #${tempJob.id.slice(0, 6).toUpperCase()}) for ${tempJob.deviceType} is now ${tempJob.status}.${itemsString}\nTotal Bill: Rs ${Number(tempJob.finalTotal || 0).toFixed(2)}${discountStr}\n\nThank you for choosing DESH Digital Hub.`;
                          
                          let formattedNum = tempJob.whatsapp.replace(/\D/g, '');
                          if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
                          window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all flex items-center gap-2"
                        title="WhatsApp Bill"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={handleSaveJob}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {isViewBillModalOpen && viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden slide-in-from-bottom-8 font-mono">

            <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  <img src={logo} alt="DESH Digital Hub" className="h-20 object-contain" />
                </div>
                <p className="text-sm">204/1, Pitapahamuna, Melsiripura</p>
                <p className="text-sm">Tel: 071 998 9000</p>
                <div className="mt-3 font-bold uppercase text-lg border-b-2 border-dashed border-slate-300 pb-2">
                  {(viewingJob.status === 'Completed' || viewingJob.status === 'Paid') ? 'FINAL BILL' : 'REPAIR ESTIMATE'}
                </div>
              </div>

              <div className="text-sm space-y-1 mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Job No:</span>
                  <span>#{viewingJob.id.slice(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Date:</span>
                  <span>{viewingJob.createdAt ? format(viewingJob.createdAt.toDate(), 'dd/MM/yyyy p') : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Customer:</span>
                  <span>{viewingJob.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Device:</span>
                  <span>{viewingJob.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Issue:</span>
                  <span className="text-right max-w-[180px]">{viewingJob.issue}</span>
                </div>
              </div>

              <div className="mb-4 text-sm border-b-2 border-dashed border-slate-300 pb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-1">Description</th>
                      <th className="text-right py-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingJob.status === 'Completed' || viewingJob.status === 'Paid') ? (
                      <>
                        {(viewingJob.parts || []).map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-1">{p.name}</td>
                            <td className="text-right py-1">{(Number(p.sellingPrice) || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        {Number(viewingJob.laborCharge) > 0 && (
                          <tr>
                            <td className="py-1">Labor Charge</td>
                            <td className="text-right py-1">{(Number(viewingJob.laborCharge) || 0).toFixed(2)}</td>
                          </tr>
                        )}
                        {Number(viewingJob.discount) > 0 && (
                          <tr>
                            <td className="py-1">Discount</td>
                            <td className="text-right py-1">-{(Number(viewingJob.discount) || 0).toFixed(2)}</td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <>
                        {viewingJob.calcItems && viewingJob.calcItems.length > 0 && viewingJob.calcItems.some(i => i.desc) ? (
                          viewingJob.calcItems.filter(i => i.desc).map((p, idx) => (
                            <tr key={idx}>
                              <td className="py-1">{p.desc}</td>
                              <td className="text-right py-1">{(Number(p.amount) || 0).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-2 text-slate-500 italic text-center">
                              Reason: {viewingJob.estCostReason || 'N/A'}
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-sm space-y-1 mb-6">
                {(viewingJob.status === 'Completed' || viewingJob.status === 'Paid') ? (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rs {((viewingJob.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0) + Number(viewingJob.laborCharge || 0) - Number(viewingJob.discount || 0)).toFixed(2)}</span>
                    </div>
                    {Number(viewingJob.advancePayment) > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Advance Paid:</span>
                        <span>- Rs {Number(viewingJob.advancePayment).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-300">
                      <span>FINAL TOTAL:</span>
                      <span>Rs {Number(viewingJob.finalTotal || 0).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-bold text-lg">
                      <span>EST. TOTAL:</span>
                      <span>Rs {Number(viewingJob.estCost || 0).toFixed(2)}</span>
                    </div>
                    {Number(viewingJob.advancePayment) > 0 && (
                      <div className="flex justify-between text-slate-600 mt-1">
                        <span>ADVANCE PAID:</span>
                        <span>- Rs {Number(viewingJob.advancePayment).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(viewingJob.discount) > 0 && (
                      <div className="flex justify-between text-red-500 mt-1">
                        <span>DISCOUNT:</span>
                        <span>- Rs {Number(viewingJob.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-300">
                      <span>BALANCE:</span>
                      <span>Rs {Math.max(0, Number(viewingJob.estCost || 0) - Number(viewingJob.advancePayment || 0) - Number(viewingJob.discount || 0)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-xs text-slate-500">
                {!(viewingJob.status === 'Completed' || viewingJob.status === 'Delivered') && (
                  <div className="mb-2">*This is only an estimate.*</div>
                )}
                <div>Thank you for your business!</div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex justify-end gap-3 border-t border-slate-200">
              <div className="flex gap-2">
                {viewingJob.whatsapp && (
                  <button
                    onClick={() => {
                      const isComplete = viewingJob.status === 'Completed' || viewingJob.status === 'Paid';
                      const advance = Number(viewingJob.advancePayment || 0);
                      const disc = Number(viewingJob.discount || 0);
                      const itemsText = [];
                      if (viewingJob.parts && viewingJob.parts.length > 0) {
                        viewingJob.parts.forEach(p => itemsText.push(`- ${p.name}: Rs ${p.sellingPrice.toFixed(2)}`));
                      }
                      if (viewingJob.calcItems && viewingJob.calcItems.length > 0) {
                        viewingJob.calcItems.filter(i => i.desc).forEach(p => itemsText.push(`- ${p.desc}: Rs ${Number(p.amount || 0).toFixed(2)}`));
                      }
                      const itemsString = itemsText.length > 0 ? `\n\nServices & Items:\n${itemsText.join('\n')}\n` : '\n';

                      let msg = '';
                      
                      if (isComplete) {
                        let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
                        msg = `Hello ${viewingJob.customerName},\n\nYour repair job (Job #${viewingJob.id.slice(0, 6).toUpperCase()}) for ${viewingJob.deviceType} is now ${viewingJob.status}.${itemsString}\nTotal Bill: Rs ${Number(viewingJob.finalTotal || 0).toFixed(2)}${discountStr}\n\nThank you for choosing DESH Digital Hub.`;
                      } else {
                         const balance = Math.max(0, Number(viewingJob.estCost || 0) - advance - disc);
                         let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
                         msg = `Hello ${viewingJob.customerName},\n\nHere is your repair estimate (Job #${viewingJob.id.slice(0, 6).toUpperCase()}) for ${viewingJob.deviceType}.${itemsString}\nEstimated Cost: Rs ${Number(viewingJob.estCost || 0).toFixed(2)}\nAdvance Paid: Rs ${advance.toFixed(2)}${discountStr}\nBalance: Rs ${balance.toFixed(2)}\n\nThank you for choosing DESH Digital Hub.`;
                      }
                      let formattedNum = viewingJob.whatsapp.replace(/\D/g, '');
                      if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
                      window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-4 py-2 font-sans font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
                  >
                     <Send className="w-4 h-4" /> WhatsApp
                  </button>
                )}
                <button
                  onClick={() => setIsViewBillModalOpen(false)}
                  className="px-4 py-2 font-sans font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
              <button
                onClick={() => {
                  if (viewingJob.status === 'Completed' || viewingJob.status === 'Paid') {
                    printFinalBill(viewingJob);
                  } else {
                    printEstimate(viewingJob);
                  }
                }}
                className="px-4 py-2 font-sans font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

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
