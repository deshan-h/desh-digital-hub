import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';

export async function runFirebaseToSupabaseMigration(onProgress) {
  const log = (msg, stage, percent) => {
    console.log(`[Migration] ${msg}`);
    if (onProgress) onProgress({ message: msg, stage, percent });
  };

  const results = {
    customers: 0,
    daily_sales: 0,
    customer_dues: 0,
    repairs: 0,
    pos_categories: 0,
    expenses: 0,
    pending_orders: 0,
    settings: 0,
    errors: []
  };

  try {
    // ----------------------------------------------------
    // STAGE 1: CUSTOMERS
    // ----------------------------------------------------
    log('Fetching customers from Firebase...', 'customers', 5);
    const customersSnap = await getDocs(collection(db, 'customers'));
    const customerMapByName = {}; // name.toLowerCase() -> supabase UUID

    const customersToInsert = [];
    customersSnap.forEach(doc => {
      const d = doc.data();
      const name = d.name?.trim();
      if (name) {
        customersToInsert.push({
          firebaseId: doc.id,
          name: name,
          phone: d.phone || '',
          area: d.area || '',
          most_visited: Boolean(d.mostVisited),
          created_at: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : new Date().toISOString()
        });
      }
    });

    log(`Migrating ${customersToInsert.length} customers to Supabase...`, 'customers', 15);
    for (const c of customersToInsert) {
      const { data, error } = await supabase.from('customers').insert({
        name: c.name,
        phone: c.phone,
        area: c.area,
        most_visited: c.most_visited,
        created_at: c.created_at
      }).select('id, name').single();

      if (error) {
        results.errors.push(`Customer ${c.name}: ${error.message}`);
      } else if (data) {
        customerMapByName[c.name.toLowerCase()] = data.id;
        results.customers++;
      }
    }
    log(`Customers migrated: ${results.customers}`, 'customers', 25);

    // ----------------------------------------------------
    // STAGE 2: DAILY SALES
    // ----------------------------------------------------
    log('Fetching daily sales from Firebase...', 'sales', 30);
    const salesSnap = await getDocs(collection(db, 'daily_sales'));
    const salesMapByFirebaseId = {};

    const salesDocs = [];
    salesSnap.forEach(doc => {
      salesDocs.push({ id: doc.id, ...doc.data() });
    });

    log(`Migrating ${salesDocs.length} sales records to Supabase...`, 'sales', 35);
    for (const s of salesDocs) {
      let custId = null;
      if (s.customerName && s.customerName.trim() && s.customerName !== 'No Name Provided') {
        const key = s.customerName.trim().toLowerCase();
        custId = customerMapByName[key] || null;
      }

      const { data, error } = await supabase.from('daily_sales').insert({
        customer_id: custId,
        amount: Number(s.amount) || 0,
        discount: Number(s.discount) || 0,
        description: s.description || '',
        cart_items: s.cartItems || [],
        is_credit: Boolean(s.isCredit),
        is_account_settlement: Boolean(s.isAccountSettlement),
        user_id: s.userId || 'system',
        created_at: s.timestamp?.toDate ? s.timestamp.toDate().toISOString() : new Date().toISOString()
      }).select('id').single();

      if (error) {
        results.errors.push(`Sale ${s.id}: ${error.message}`);
      } else if (data) {
        salesMapByFirebaseId[s.id] = data.id;
        results.daily_sales++;
      }
    }
    log(`Sales records migrated: ${results.daily_sales}`, 'sales', 50);

    // ----------------------------------------------------
    // STAGE 3: CUSTOMER DUES
    // ----------------------------------------------------
    log('Fetching customer dues from Firebase...', 'dues', 55);
    const duesSnap = await getDocs(collection(db, 'customer_dues'));
    const duesDocs = [];
    duesSnap.forEach(doc => {
      duesDocs.push({ id: doc.id, ...doc.data() });
    });

    log(`Migrating ${duesDocs.length} dues records to Supabase...`, 'dues', 60);
    for (const d of duesDocs) {
      let custId = null;
      const custName = d.name?.trim();
      if (custName) {
        const key = custName.toLowerCase();
        if (!customerMapByName[key]) {
          // Auto create customer in customers table if missing
          const { data: newCust } = await supabase.from('customers').insert({
            name: custName,
            phone: d.phone || '',
            area: d.area || '',
            most_visited: false
          }).select('id').single();
          if (newCust) {
            customerMapByName[key] = newCust.id;
            results.customers++;
          }
        }
        custId = customerMapByName[key] || null;
      }

      const linkedSaleUUID = d.linkedSaleId ? salesMapByFirebaseId[d.linkedSaleId] || null : null;

      const { error } = await supabase.from('customer_dues').insert({
        customer_id: custId,
        amount: Number(d.amount) || 0,
        status: d.status || 'Pending',
        type: d.type || null,
        description: d.description || '',
        is_pos_arrears: d.isPosArrears !== false,
        linked_sale_id: linkedSaleUUID,
        created_at: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : new Date().toISOString()
      });

      if (error) {
        results.errors.push(`Due ${d.id}: ${error.message}`);
      } else {
        results.customer_dues++;
      }
    }
    log(`Customer dues migrated: ${results.customer_dues}`, 'dues', 70);

    // ----------------------------------------------------
    // STAGE 4: REPAIRS
    // ----------------------------------------------------
    log('Fetching repairs from Firebase...', 'repairs', 72);
    const repairsSnap = await getDocs(collection(db, 'repairs'));
    const repairsDocs = [];
    repairsSnap.forEach(doc => {
      repairsDocs.push({ id: doc.id, ...doc.data() });
    });

    log(`Migrating ${repairsDocs.length} repair records to Supabase...`, 'repairs', 75);
    for (const r of repairsDocs) {
      let custId = null;
      const custName = (r.customerName || r.name)?.trim();
      if (custName) {
        const key = custName.toLowerCase();
        if (!customerMapByName[key]) {
          const { data: newCust } = await supabase.from('customers').insert({
            name: custName,
            phone: r.phone || '',
            area: '',
            most_visited: false
          }).select('id').single();
          if (newCust) {
            customerMapByName[key] = newCust.id;
            results.customers++;
          }
        }
        custId = customerMapByName[key] || null;
      }

      const { error } = await supabase.from('repairs').insert({
        customer_id: custId,
        device_model: r.deviceModel || r.model || 'Unknown Device',
        issue: r.issue || '',
        cost: Number(r.cost) || 0,
        estimated_cost: Number(r.estimatedCost) || 0,
        status: r.status || 'Pending',
        is_paid: Boolean(r.isPaid),
        parts_used: r.partsUsed || [],
        created_at: r.timestamp?.toDate ? r.timestamp.toDate().toISOString() : new Date().toISOString()
      });

      if (error) {
        results.errors.push(`Repair ${r.id}: ${error.message}`);
      } else {
        results.repairs++;
      }
    }
    log(`Repairs migrated: ${results.repairs}`, 'repairs', 82);

    // ----------------------------------------------------
    // STAGE 5: POS CATEGORIES & CATALOG
    // ----------------------------------------------------
    log('Fetching POS Categories from Firebase...', 'categories', 85);
    const catSnap = await getDocs(collection(db, 'pos_categories'));
    for (const doc of catSnap.docs) {
      const c = doc.data();
      const { error } = await supabase.from('pos_categories').insert({
        category: c.category || 'General',
        icon: c.icon || 'Package',
        items: c.items || [],
        created_at: new Date().toISOString()
      });
      if (error) {
        results.errors.push(`Category ${c.category}: ${error.message}`);
      } else {
        results.pos_categories++;
      }
    }
    log(`POS Categories migrated: ${results.pos_categories}`, 'categories', 90);

    // ----------------------------------------------------
    // STAGE 6: EXPENSES
    // ----------------------------------------------------
    log('Fetching expenses from Firebase...', 'expenses', 92);
    const expSnap = await getDocs(collection(db, 'expenses'));
    for (const doc of expSnap.docs) {
      const e = doc.data();
      const { error } = await supabase.from('expenses').insert({
        amount: Number(e.amount) || 0,
        category: e.category || 'General',
        note: e.note || '',
        created_at: e.timestamp?.toDate ? e.timestamp.toDate().toISOString() : new Date().toISOString()
      });
      if (error) {
        results.errors.push(`Expense ${doc.id}: ${error.message}`);
      } else {
        results.expenses++;
      }
    }
    log(`Expenses migrated: ${results.expenses}`, 'expenses', 95);

    // ----------------------------------------------------
    // STAGE 7: PENDING ORDERS
    // ----------------------------------------------------
    log('Fetching pending orders from Firebase...', 'pending_orders', 96);
    const pendingSnap = await getDocs(collection(db, 'pending_orders'));
    for (const doc of pendingSnap.docs) {
      const p = doc.data();
      const custKey = p.note?.trim().toLowerCase();
      const custId = custKey ? customerMapByName[custKey] || null : null;

      const { error } = await supabase.from('pending_orders').insert({
        customer_id: custId,
        note: p.note || '',
        items: p.items || [],
        total_amount: Number(p.totalAmount) || 0,
        discount: Number(p.discount) || 0,
        created_at: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : new Date().toISOString()
      });
      if (error) {
        results.errors.push(`Pending Order ${doc.id}: ${error.message}`);
      } else {
        results.pending_orders++;
      }
    }

    // ----------------------------------------------------
    // STAGE 8: SETTINGS
    // ----------------------------------------------------
    log('Fetching settings from Firebase...', 'settings', 98);
    const settingsSnap = await getDocs(collection(db, 'settings'));
    for (const doc of settingsSnap.docs) {
      const s = doc.data();
      const { error } = await supabase.from('settings').upsert({
        id: doc.id,
        data: s
      });
      if (error) {
        results.errors.push(`Settings ${doc.id}: ${error.message}`);
      } else {
        results.settings++;
      }
    }
    results.settings = settingsSnap.size;

    log('All data migration completed successfully!', 'completed', 100);
    return { success: true, results };
  } catch (err) {
    console.error('Fatal migration error:', err);
    results.errors.push(`Fatal Error: ${err.message}`);
    return { success: false, results, error: err.message };
  }
}
