import { supabase } from '../config/supabase';

// ==========================================
// 1. AUTH SERVICE
// ==========================================
export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Email is not confirmed yet. Please confirm the user in Supabase Dashboard -> Authentication -> Users.');
      }
      throw error;
    }
    return { ...data.user, uid: data.user.id };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback) {
    // Immediate initial check
    supabase.auth.getSession().then(({ data }) => {
      const u = data?.session?.user ? { ...data.session.user, uid: data.session.user.id } : null;
      callback(u);
    }).catch(() => callback(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ? { ...session.user, uid: session.user.id } : null;
      callback(u);
    });
    return () => subscription.unsubscribe();
  }
};

// ==========================================
// 2. CUSTOMERS SERVICE
// ==========================================
export const customerService = {
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      area: c.area || '',
      mostVisited: Boolean(c.most_visited),
      timestamp: c.created_at,
      createdAt: c.created_at
    }));
  },

  async createCustomer({ name, phone = '', area = '', mostVisited = false }) {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: name.trim(),
        phone: (phone || '').trim(),
        area: (area || '').trim(),
        most_visited: Boolean(mostVisited)
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      area: data.area || '',
      mostVisited: Boolean(data.most_visited),
      timestamp: data.created_at
    };
  },

  async updateCustomer(id, updates) {
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.phone !== undefined) payload.phone = (updates.phone || '').trim();
    if (updates.area !== undefined) payload.area = (updates.area || '').trim();
    if (updates.mostVisited !== undefined) payload.most_visited = Boolean(updates.mostVisited);

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomer(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async findOrCreateCustomerByName(name, phone = '', area = '') {
    const trimmed = (name || '').trim();
    if (!trimmed || trimmed === 'No Name Provided') return null;

    const { data: existing } = await supabase
      .from('customers')
      .select('id, name, phone, area')
      .ilike('name', trimmed)
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (phone && !existing.phone) {
        await supabase.from('customers').update({ phone: phone.trim() }).eq('id', existing.id);
      }
      return existing.id;
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        name: trimmed,
        phone: (phone || '').trim(),
        area: (area || '').trim(),
        most_visited: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error auto-creating customer:', error);
      return null;
    }
    return created.id;
  }
};

// ==========================================
// 3. SALES SERVICE
// ==========================================
export const salesService = {
  async getSales() {
    const { data, error } = await supabase
      .from('view_daily_sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      amount: Number(s.amount),
      discount: Number(s.discount || 0),
      description: s.description || '',
      cartItems: s.cart_items || [],
      isCredit: Boolean(s.is_credit),
      isAccountSettlement: Boolean(s.is_account_settlement),
      userId: s.user_id,
      customerId: s.customer_id,
      customerName: s.customer_name || 'No Name Provided',
      customerPhone: s.customer_phone || '',
      customerArea: s.customer_area || '',
      timestamp: s.created_at,
      createdAt: s.created_at
    }));
  },

  async createSale({
    amount,
    discount = 0,
    description = '',
    cartItems = [],
    customerName = '',
    customerPhone = '',
    isCredit = false,
    isAccountSettlement = false,
    userId = 'system'
  }) {
    let customerId = null;
    if (customerName && customerName.trim() && customerName.trim() !== 'No Name Provided') {
      customerId = await customerService.findOrCreateCustomerByName(customerName, customerPhone);
    }

    const { data, error } = await supabase
      .from('daily_sales')
      .insert({
        customer_id: customerId,
        amount: Number(amount),
        discount: Number(discount || 0),
        description,
        cart_items: cartItems,
        is_credit: Boolean(isCredit),
        is_account_settlement: Boolean(isAccountSettlement),
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      ...data,
      customerName: customerName || 'No Name Provided',
      cartItems: data.cart_items,
      isCredit: data.is_credit,
      timestamp: data.created_at
    };
  },

  async deleteSale(id) {
    const { error } = await supabase
      .from('daily_sales')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async updateSale(id, updates) {
    const payload = {};
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.cartItems !== undefined) payload.cart_items = updates.cartItems;
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.discount !== undefined) payload.discount = Number(updates.discount);
    if (updates.isCredit !== undefined) payload.is_credit = Boolean(updates.isCredit);

    const { data, error } = await supabase
      .from('daily_sales')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ==========================================
// 4. CUSTOMER DUES SERVICE
// ==========================================
export const duesService = {
  async getCustomerDues() {
    const { data, error } = await supabase
      .from('view_customer_dues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      customerId: d.customer_id,
      name: d.customer_name || 'Unknown',
      phone: d.customer_phone || '',
      area: d.customer_area || '',
      amount: Number(d.amount),
      status: d.status || 'Pending',
      type: d.type || null,
      description: d.description || '',
      isPosArrears: Boolean(d.is_pos_arrears),
      linkedSaleId: d.linked_sale_id,
      timestamp: d.created_at,
      createdAt: d.created_at
    }));
  },

  async createDue({
    customerId = null,
    customerName,
    phone = '',
    area = '',
    amount,
    status = 'Pending',
    type = null,
    description = '',
    isPosArrears = true,
    linkedSaleId = null
  }) {
    let finalCustId = customerId;
    if (!finalCustId && customerName) {
      finalCustId = await customerService.findOrCreateCustomerByName(customerName, phone, area);
    }

    const { data, error } = await supabase
      .from('customer_dues')
      .insert({
        customer_id: finalCustId,
        amount: Number(amount),
        status,
        type,
        description,
        is_pos_arrears: Boolean(isPosArrears),
        linked_sale_id: linkedSaleId || null
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: customerName,
      phone,
      area,
      ...data,
      timestamp: data.created_at
    };
  },

  async updateDue(id, updates) {
    const payload = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.linkedSaleId !== undefined) payload.linked_sale_id = updates.linkedSaleId;

    const { data, error } = await supabase
      .from('customer_dues')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDue(id) {
    const { error } = await supabase
      .from('customer_dues')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// ==========================================
// 5. POS CATEGORIES & ITEMS SERVICE
// ==========================================
export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('pos_categories')
      .select('*');

    if (error) throw error;
    return (data || []).map(cat => ({
      id: cat.id,
      category: cat.category,
      icon: cat.icon || 'Package',
      items: cat.items || [],
      order: cat.order,
      timestamp: cat.created_at
    }));
  },

  async createCategory({ category, icon = 'Package', items = [], order = 999 }) {
    const { data, error } = await supabase
      .from('pos_categories')
      .insert({ category, icon, items, order })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('pos_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('pos_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  subscribe(callback) {
    const channelName = `pos_categories_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_categories' }, () => {
        categoryService.getCategories().then(callback).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// ==========================================
// 6. REPAIRS SERVICE
// ==========================================
export const repairService = {
  async getRepairs() {
    const { data, error } = await supabase
      .from('view_repairs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      customerId: r.customer_id,
      customerName: r.customer_name || 'Unknown',
      phone: r.customer_phone || '',
      deviceModel: r.device_model,
      issue: r.issue,
      cost: Number(r.cost || 0),
      estimatedCost: Number(r.estimated_cost || 0),
      status: r.status || 'Pending',
      isPaid: Boolean(r.is_paid),
      partsUsed: r.parts_used || [],
      timestamp: r.created_at,
      createdAt: r.created_at
    }));
  },

  async createRepair({
    customerName,
    phone = '',
    deviceModel,
    issue = '',
    cost = 0,
    estimatedCost = 0,
    status = 'Pending',
    isPaid = false,
    partsUsed = []
  }) {
    const customerId = await customerService.findOrCreateCustomerByName(customerName, phone);

    const { data, error } = await supabase
      .from('repairs')
      .insert({
        customer_id: customerId,
        device_model: deviceModel,
        issue,
        cost: Number(cost || 0),
        estimated_cost: Number(estimatedCost || 0),
        status,
        is_paid: Boolean(isPaid),
        parts_used: partsUsed
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      customerName,
      phone,
      ...data,
      timestamp: data.created_at
    };
  },

  async updateRepair(id, updates) {
    const payload = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.cost !== undefined) payload.cost = Number(updates.cost);
    if (updates.estimatedCost !== undefined) payload.estimated_cost = Number(updates.estimatedCost);
    if (updates.isPaid !== undefined) payload.is_paid = Boolean(updates.isPaid);
    if (updates.partsUsed !== undefined) payload.parts_used = updates.partsUsed;
    if (updates.issue !== undefined) payload.issue = updates.issue;
    if (updates.deviceModel !== undefined) payload.device_model = updates.deviceModel;

    const { data, error } = await supabase
      .from('repairs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRepair(id) {
    const { error } = await supabase
      .from('repairs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// ==========================================
// 7. EXPENSES SERVICE
// ==========================================
export const expenseService = {
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      itemName: e.note || e.category || 'Expense',
      amount: Number(e.amount),
      category: e.category || 'General',
      note: e.note || '',
      timestamp: e.created_at,
      createdAt: e.created_at
    }));
  },

  async createExpense({ itemName, amount, category = 'General', expenseDate = null }) {
    const createdAt = expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        amount: Number(amount),
        category: category || 'General',
        note: itemName,
        created_at: createdAt
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      itemName: data.note,
      amount: Number(data.amount),
      category: data.category,
      timestamp: data.created_at
    };
  },

  async deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// ==========================================
// 8. PENDING ORDERS SERVICE
// ==========================================
export const pendingOrderService = {
  async getPendingOrders() {
    const { data, error } = await supabase
      .from('pending_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      customerId: p.customer_id,
      note: p.note,
      phone: p.phone || '',
      items: p.items || [],
      totalAmount: Number(p.total_amount),
      discount: Number(p.discount || 0),
      createdAt: p.created_at,
      timestamp: p.created_at
    }));
  },

  async createPendingOrder({ note, phone = '', items = [], totalAmount, discount = 0 }) {
    let customerId = null;
    if (note && note.trim() && note.trim() !== 'No Name Provided') {
      try {
        customerId = await customerService.findOrCreateCustomerByName(note, phone);
      } catch (err) {
        console.warn('Could not find/create customer for pending sale:', err);
      }
    }

    const payload = {
      note,
      items,
      total_amount: Number(totalAmount),
      discount: Number(discount || 0)
    };

    if (customerId) {
      payload.customer_id = customerId;
    }

    const { data, error } = await supabase
      .from('pending_orders')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      note: data.note,
      phone: phone || '',
      items: data.items,
      totalAmount: Number(data.total_amount),
      createdAt: data.created_at
    };
  },

  async updatePendingOrder(id, updates) {
    const payload = {};
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.items !== undefined) payload.items = updates.items;
    if (updates.totalAmount !== undefined) payload.total_amount = Number(updates.totalAmount);
    if (updates.discount !== undefined) payload.discount = Number(updates.discount);
    if (updates.customerId !== undefined) payload.customer_id = updates.customerId;

    if (updates.phone && updates.note) {
      try {
        await customerService.findOrCreateCustomerByName(updates.note, updates.phone);
      } catch (e) {
        console.warn('Could not update customer phone:', e);
      }
    }

    const { data, error } = await supabase
      .from('pending_orders')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePendingOrder(id) {
    const { error } = await supabase
      .from('pending_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  subscribe(callback) {
    const channelName = `pending_orders_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_orders' }, () => {
        pendingOrderService.getPendingOrders().then(callback).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// ==========================================
// 9. SETTINGS SERVICE
// ==========================================
export const settingsService = {
  async getSetting(id) {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data?.data ?? null;
  },

  async saveSetting(id, data) {
    const { error } = await supabase
      .from('settings')
      .upsert({ id, data });

    if (error) throw error;
    return true;
  },

  // Alias for backward compatibility
  async setSetting(id, data) {
    return this.saveSetting(id, data);
  },

  async getPublicCategoryVisibility() {
    try {
      const data = await this.getSetting('public_categories_visibility');
      return Array.isArray(data?.hiddenIds) ? data.hiddenIds : [];
    } catch (e) {
      console.error('Failed to load category visibility:', e);
      return [];
    }
  },

  async setPublicCategoryVisibility(hiddenIds) {
    return await this.saveSetting('public_categories_visibility', { hiddenIds: Array.from(new Set(hiddenIds)) });
  }
};

// ==========================================
// 10. CUSTOMER INQUIRIES & CHAT SERVICE
// ==========================================
export const inquiryService = {
  async getInquiries() {
    try {
      const data = await settingsService.getSetting('customer_inquiries');
      if (Array.isArray(data?.items)) {
        return data.items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
      return [];
    } catch (e) {
      console.error('Failed to load inquiries:', e);
      return [];
    }
  },

  async createInquiry({ name, phone, service, message, source = 'System Web' }) {
    try {
      const existing = await this.getInquiries();
      const newInquiry = {
        id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        phone: phone.trim(),
        service: service || 'General Inquiry',
        message: message ? message.trim() : '',
        source: source || 'System Web',
        status: 'new', // 'new' | 'read' | 'replied'
        createdAt: new Date().toISOString()
      };

      const updated = [newInquiry, ...existing];
      await settingsService.saveSetting('customer_inquiries', { items: updated });
      return newInquiry;
    } catch (e) {
      console.error('Failed to save inquiry:', e);
      throw e;
    }
  },

  async updateInquiryStatus(id, status) {
    const existing = await this.getInquiries();
    const updated = existing.map(item => item.id === id ? { ...item, status } : item);
    await settingsService.saveSetting('customer_inquiries', { items: updated });
    return true;
  },

  async deleteInquiry(id) {
    const existing = await this.getInquiries();
    const updated = existing.filter(item => item.id !== id);
    await settingsService.saveSetting('customer_inquiries', { items: updated });
    return true;
  },

  async markAllAsRead() {
    try {
      const existing = await this.getInquiries();
      const updated = existing.map(item => ({ ...item, status: 'read' }));
      await settingsService.saveSetting('customer_inquiries', { items: updated });
      return updated;
    } catch (e) {
      console.error('Failed to mark inquiries as read:', e);
      throw e;
    }
  },

  subscribe(callback) {
    // Initial fetch
    this.getInquiries().then(callback).catch(console.error);

    // Realtime channel with unique channel name to prevent duplicate subscription collisions
    const channelName = `customer_inquiries_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.customer_inquiries' }, () => {
        this.getInquiries().then(callback).catch(console.error);
      })
      .subscribe();

    // Polling fallback every 15 seconds to catch inquiries across devices
    const interval = setInterval(() => {
      this.getInquiries().then(callback).catch(console.error);
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }
};
