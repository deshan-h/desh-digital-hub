import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/config/firebase.js';

async function checkShopExpenses() {
  try {
    const snap = await getDocs(collection(db, 'shop_expenses'));
    console.log('shop_expenses count:', snap.size);
    snap.docs.slice(0, 3).forEach(d => console.log(d.id, d.data()));
  } catch (e) {
    console.error('Error reading shop_expenses:', e.message);
  }
}
checkShopExpenses();
