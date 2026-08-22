import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc, where, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { format } from 'date-fns';
import logo from '../../assets/logo.webp';
import { notify } from '../../utils/toast';
import { syncSaleToExpenseTracker } from '../../utils/expenseTrackerSync';

// Components

import AdminLayout from '../../layouts/AdminLayout';
import Login from './Login';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import Loader from '../../components/Loader';

// Code Splitting (Lazy Load Route Components)
const Dashboard = lazy(() => import('./Dashboard'));
const POS = lazy(() => import('./POS'));
const History = lazy(() => import('./History'));
const Repairs = lazy(() => import('./Repairs'));
const Customers = lazy(() => import('./Customers'));
const Expenses = lazy(() => import('./Expenses'));
const ItemsManager = lazy(() => import('./ItemsManager'));
const CustomerDirectory = lazy(() => import('./CustomerDirectory'));
const Settings = lazy(() => import('./Settings'));

const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState('pos');
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('salesHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [customersList, setCustomersList] = useState(() => {
    const saved = localStorage.getItem('customersList');
    return saved ? JSON.parse(saved) : [];
  });
  const [posCategories, setPosCategories] = useState(() => {
    const saved = localStorage.getItem('posCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const [chartData, setChartData] = useState(() => {
    const saved = localStorage.getItem('chartData');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalPendingDues, setTotalPendingDues] = useState(() => {
    const saved = localStorage.getItem('totalPendingDues');
    return saved ? JSON.parse(saved) : 0;
  });
  const [customerDuesList, setCustomerDuesList] = useState(() => {
    const saved = localStorage.getItem('customerDuesList');
    return saved ? JSON.parse(saved) : [];
  });

  // POS State
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);

  const isAdmin = user?.email === 'admin@desh.lk';

  // 1. Title, Auth Listener, and PWA Registration
  useEffect(() => {
    document.title = "Admin - DESH Digital Hub";

    // Register Service Worker for PWA only in Admin portal
    if ('serviceWorker' in navigator) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({ immediate: true });
      }).catch((err) => console.log('PWA registration error', err));
    }

    return () => {
      document.title = "DESH Digital Hub";
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSales();
        fetchCategories();
        fetchCustomerDues();
        fetchCustomersList();
        setActiveTab('pos');
      }
      setAuthLoading(false);
    });

    const pendingQ = query(collection(db, 'pos_pending_orders'), orderBy('createdAt', 'desc'));
    const pendingUnsubscribe = onSnapshot(pendingQ, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setPendingOrders(orders);
    });

    return () => {
      unsubscribe();
      pendingUnsubscribe();
    };
  }, []);

  // 2. Fetch Sales Data
  async function fetchSales() {
    try {
      const q = query(collection(db, 'daily_sales'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const sales = [];
      const aggregatedData = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({ id: doc.id, ...data });

        // Prepare chart data (Group by date)
        if (data.timestamp) {
          const dateStr = format(parseTimestamp(data.timestamp), 'MMM dd');
          if (!aggregatedData[dateStr]) aggregatedData[dateStr] = 0;
          aggregatedData[dateStr] += Number(data.amount);
        }
      });

      setSalesHistory(sales);
      localStorage.setItem('salesHistory', JSON.stringify(sales));

      // Format chart data for recharts
      const formattedChartData = Object.keys(aggregatedData).map(date => ({
        date,
        revenue: aggregatedData[date]
      })).reverse(); // Oldest to newest for the chart

      setChartData(formattedChartData);
      localStorage.setItem('chartData', JSON.stringify(formattedChartData));
    } catch (error) {
      console.error("Error fetching sales: ", error);
    }
  }

  // 3. Fetch Categories Data
  async function fetchCategories() {
    try {
      const snap = await getDocs(collection(db, 'pos_categories'));
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Remove Custom & Utilities completely from POS and Items Manager
      data = data.filter(cat => cat.category !== 'Custom & Utilities');
      
      // Temporary Migration: Update 'Graphic & Editing' to 'Type Setting' in Firestore
      data = await Promise.all(data.map(async (cat) => {
        if (cat.category === 'Graphic & Editing') {
          cat.category = 'Type Setting';
          cat.icon = 'Type';
          cat.color = 'text-orange-400';
          try {
            await updateDoc(doc(db, 'pos_categories', cat.id), { 
              category: 'Type Setting', 
              icon: 'Type',
              color: 'text-orange-400'
            });
          } catch (e) {
            console.error("Migration update failed", e);
          }
        }
        return cat;
      }));

      const CATEGORY_ORDER = [
        "Printing & Scanning",
        "Document Laminating",
        "Book Binding",
        "Type Setting",
        "Online Services",
        "Downloads & Media",
        "Custom & Utilities"
      ];
      
      data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        let indexA = CATEGORY_ORDER.indexOf(a.category);
        let indexB = CATEGORY_ORDER.indexOf(b.category);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
      });

      // We no longer sort items by price to respect the custom order set in ItemsManager
      // data.forEach(cat => {
      //   if (cat.items && Array.isArray(cat.items)) {
      //     cat.items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      //   }
      // });

      setPosCategories(data);
      localStorage.setItem('posCategories', JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function fetchCustomerDues() {
    try {
      const snap = await getDocs(collection(db, 'customer_dues'));
      let total = 0;
      const duesList = [];
      snap.forEach(doc => {
        const data = doc.data();
        // Include both Pending debts and Payments in the dues list
        if (data.status === 'Pending' || data.type === 'Payment') {
          if (data.type === 'Payment') {
            total -= Number(data.amount || 0);
          } else if (data.status === 'Pending') {
            total += Number(data.amount || 0);
          }
          duesList.push({ id: doc.id, ...data });
        }
      });
      // Prevent floating point negative dust
      total = Math.max(0, total);
      setTotalPendingDues(total);
      localStorage.setItem('totalPendingDues', JSON.stringify(total));
      setCustomerDuesList(duesList);
      localStorage.setItem('customerDuesList', JSON.stringify(duesList));
    } catch (error) {
      console.error("Error fetching customer dues:", error);
    }
  }

  async function fetchCustomersList() {
    try {
      const q = query(collection(db, 'customers'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setCustomersList(data);
      localStorage.setItem('customersList', JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching customers list:", error);
    }
  }

  // 3. Auth Methods
  const handleLogin = async (e, rememberMe) => {
    e.preventDefault();
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      notify.error('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 4. POS Cart Methods
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const updateCartItem = useCallback((id, field, value) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        let newVal;
        if (field === 'qty') {
          newVal = value === '' ? '' : Math.max(1, Number(value));
        } else {
          newVal = value === '' ? '' : Math.max(0, Number(value));
        }
        return { ...item, [field]: newVal };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async (posCustomerName = '', discount = 0, isCredit = false, cashGivenAmount = '', currentArrears = 0) => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    const description = cart.map(item => `${item.qty}x ${item.name}`).join(', ');
    const finalTotal = Math.max(0, cartTotal - Number(discount));
    const cashInput = cashGivenAmount === '' ? 0 : Number(cashGivenAmount);
    
    // Determine actual cash to apply based on input and credit mode
    let actualCash = (isCredit && cashGivenAmount === '') ? 0 : (cashGivenAmount === '' ? finalTotal : cashInput);
    
    let saleAmount = 0;
    let pendingToAdd = 0;
    let paymentToAdd = 0;

    if (isCredit) {
      // Put whole bill on pending, and whatever cash they gave as payment
      saleAmount = actualCash;
      pendingToAdd = finalTotal;
      if (actualCash > 0) {
        paymentToAdd = actualCash;
      }
    } else {
      if (actualCash < finalTotal) {
        // They didn't pay enough, force it to be a credit transaction
        saleAmount = actualCash;
        pendingToAdd = finalTotal;
        if (actualCash > 0) {
          paymentToAdd = actualCash;
        }
      } else {
        // They paid enough to cover the bill
        const excess = actualCash - finalTotal;
        const appliedToArrears = Math.min(excess, currentArrears); // Only apply up to what they owe
        saleAmount = finalTotal + appliedToArrears; // The rest is considered change given back to the customer
        if (appliedToArrears > 0) {
          paymentToAdd = appliedToArrears;
        }
      }
    }

    let finalCustomerName = posCustomerName.trim();
    if (!finalCustomerName) {
      const todaySalesCount = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === new Date().toDateString()).length;
      finalCustomerName = `Customer ${todaySalesCount + 1}`;
    } else if (!finalCustomerName.startsWith('Customer ')) {
      // Add to customers collection if not exists
      try {
        const q = query(collection(db, 'customers'), where('name', '==', finalCustomerName));
        const qs = await getDocs(q);
        if (qs.empty) {
          await addDoc(collection(db, 'customers'), {
            name: finalCustomerName,
            phone: whatsappNumber || '',
            area: '',
            timestamp: serverTimestamp()
          });
          fetchCustomersList(); // Refresh list
        }
      } catch (err) {
        console.error("Error saving new customer:", err);
      }
    }

    try {
      const cleanCartItems = cart.map(item => {
        const { CatIcon, catColor, ...cleanItem } = item;
        return cleanItem;
      });

      if (saleAmount > 0) {
        await addDoc(collection(db, 'daily_sales'), {
          amount: saleAmount,
          discount: Number(discount),
          description: description + (paymentToAdd > 0 ? ` (Incl. Rs ${paymentToAdd.toFixed(2)} Arrears Payment)` : '') + (isCredit ? ` (Partial)` : ''),
          cartItems: cleanCartItems,
          timestamp: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email,
          customerName: finalCustomerName,
          isCredit: false
        });
      }

      if (pendingToAdd > 0) {
         await addDoc(collection(db, 'customer_dues'), {
           name: finalCustomerName,
           phone: whatsappNumber || '',
           area: '',
           amount: pendingToAdd,
           status: 'Pending',
           description: description,
           timestamp: serverTimestamp()
         });
      }

      if (paymentToAdd > 0) {
         await addDoc(collection(db, 'customer_dues'), {
           name: finalCustomerName,
           phone: whatsappNumber || '',
           area: '',
           amount: paymentToAdd,
           status: 'Paid',
           type: 'Payment',
           description: 'Payment Received',
           timestamp: serverTimestamp()
         });
      }

      if (pendingToAdd > 0 || paymentToAdd > 0) {
         fetchCustomerDues();
      }
      
      // Trigger external sync asynchronously so it doesn't block UI
      // Removed automatic push sync, as we now use manual pull sync from Expense Tracker side
      // syncSaleToExpenseTracker(cartTotal, `POS Sale: ${description}`).catch(console.error);

      setCart([]);
      notify.success('Checkout successful!');
      fetchSales(); 
      return true;
    } catch (error) {
      console.error("Error adding sale: ", error);
      notify.error("Checkout failed. Please try again.");
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Sales History Delete State
  const [deleteSaleId, setDeleteSaleId] = useState(null);

  const handleDeleteSale = (id) => {
    setDeleteSaleId(id);
  };

  const confirmDeleteSale = async () => {
    if (!deleteSaleId) return;
    try {
      await deleteDoc(doc(db, 'daily_sales', deleteSaleId));
      fetchSales(); // Refresh the list
      notify.success("Record deleted successfully.");
    } catch (error) {
      console.error("Error deleting sale: ", error);
      notify.error("Failed to delete record.");
    }
  };

  const sendWhatsAppBill = () => {
    if (!whatsappNumber) {
      notify.error('Please enter a WhatsApp number.');
      return;
    }

    let text = '*DESH Digital Hub*\n';
    text += 'Thank you for your business!\n\n';
    text += '*Your Order:*\n';

    cart.forEach(item => {
      text += `- ${item.name} x${item.qty} (Rs. ${(item.price * item.qty).toFixed(2)})\n`;
    });

    text += `\n*Total Amount:* Rs. ${cartTotal.toFixed(2)}\n\n`;
    text += 'For inquiries, call +94(71) 998 9000.';

    const encodedMessage = encodeURIComponent(text);

    let formattedNumber = whatsappNumber.trim();
    if (formattedNumber.startsWith('0')) {
      formattedNumber = formattedNumber.substring(1);
    }

    window.open(`https://wa.me/94${formattedNumber}?text=${encodedMessage}`, '_blank');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400/70 text-sm font-medium animate-pulse">Loading Admin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <>
      {/* Printable Receipt */}
      <div className="hidden print:block text-black bg-white p-4 font-mono w-[80mm] mx-auto text-sm">
        <div className="text-center mb-4">
          <img src={logo} alt="DESH Digital Hub" className="h-16 mx-auto mb-2 grayscale" />
          <h2 className="font-bold text-xl">DESH Digital Hub</h2>
          <p className="text-xs">No 123, Main Street, City</p>
          <p className="text-xs">Tel: 077 123 4567</p>
        </div>

        <div className="border-t border-b border-black border-dashed py-2 mb-2">
          <p>Date: {new Date().toLocaleString()}</p>
          <p>Cashier: {user.email}</p>
        </div>

        <table className="w-full text-left mb-2 text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="pb-1">Item</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td className="py-1 pr-1">{item.name}</td>
                <td className="py-1 text-center">{item.qty}</td>
                <td className="py-1 text-right">{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black border-dashed pt-2 flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>Rs {cartTotal.toFixed(2)}</span>
        </div>

        <div className="text-center mt-6 text-xs">
          <p>Thank you for your business!</p>
          <p>System by Antigravity</p>
        </div>
      </div>

      {/* Main Admin UI */}
      <AdminLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        user={user}
        todaySalesSum={salesHistory
          .filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === new Date().toDateString())
          .reduce((sum, s) => sum + Number(s.amount), 0)}
        totalPendingDues={totalPendingDues}
        pendingOrders={pendingOrders}
        setShowPendingOrdersModal={setShowPendingOrdersModal}
      >
        <Suspense fallback={<Loader />}>
          {activeTab === 'dashboard' && <Dashboard salesHistory={salesHistory} setActiveTab={setActiveTab} posCategories={posCategories} totalPendingDues={totalPendingDues} fetchSales={fetchSales} fetchCustomerDues={fetchCustomerDues} />}
          {activeTab === 'pos' && (
            <POS 
              cart={cart}
              setCart={setCart}
              addToCart={addToCart}
              updateCartItem={updateCartItem}
              removeCartItem={removeFromCart}
              posCategories={posCategories}
              cartTotal={cartTotal}
              handleCheckout={handleCheckout}
              checkoutLoading={checkoutLoading}
              whatsappNumber={whatsappNumber}
              setWhatsappNumber={setWhatsappNumber}
              sendWhatsAppBill={sendWhatsAppBill}
              customersList={customersList}
              salesHistory={salesHistory}
              customerDuesList={customerDuesList}
              refreshPOSData={fetchCategories}
              pendingOrders={pendingOrders}
              showPendingOrdersModal={showPendingOrdersModal}
              setShowPendingOrdersModal={setShowPendingOrdersModal}
              todaySalesSum={salesHistory
                .filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === new Date().toDateString())
                .reduce((sum, s) => sum + Number(s.amount), 0)}
              totalPendingDues={totalPendingDues}
            />
          )}
          {activeTab === 'customers' && <Customers isAdmin={isAdmin} />}
          {activeTab === 'customer_directory' && <CustomerDirectory isAdmin={isAdmin} />}
          {activeTab === 'expenses' && <Expenses isAdmin={isAdmin} />}
          {activeTab === 'history' && <History salesHistory={salesHistory} fetchSales={fetchSales} handleDeleteSale={handleDeleteSale} user={user} posCategories={posCategories} isAdmin={isAdmin} />}
          {activeTab === 'repairs' && <Repairs user={user} fetchSales={fetchSales} />}
          {activeTab === 'items' && <ItemsManager posCategories={posCategories} fetchCategories={fetchCategories} />}
          {activeTab === 'settings' && <Settings isAdmin={isAdmin} />}
        </Suspense>
      </AdminLayout>

      <DeleteConfirmModal 
        isOpen={!!deleteSaleId} 
        onClose={() => setDeleteSaleId(null)} 
        onConfirm={confirmDeleteSale}
        title="Delete Sale Record?"
        message="Are you sure you want to delete this sales record? This action cannot be undone."
      />
    </>
  );
}
