import {fetchSection} from './utils/section-rendering.js';

const modal = document.getElementById('BulkModal');
const tbody = modal ? modal.querySelector('tbody') : null;
let releaseFocus = null;

function trapFocus(el) {
  const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function handler(e){
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){e.preventDefault();last.focus();}
      if(!e.shiftKey && document.activeElement === last){e.preventDefault();first.focus();}
    }
    if(e.key === 'Escape') closeModal();
  }
  el.addEventListener('keydown', handler);
  first && first.focus();
  return () => el.removeEventListener('keydown', handler);
}

function openModal(product){
  modal.querySelector('h2').textContent = product.title;
  tbody.innerHTML = '';
  product.variants.forEach(v => {
    const tr = document.createElement('tr');
    tr.className = 'bulk-row' + (v.available ? '' : ' is--sold-out');
    tr.dataset.variantId = v.id;
    tr.dataset.price = v.price;
    const qtyPicker = v.available ?
      `<div class="qty-picker" data-qty-root>
        <button type="button" class="qty-btn" data-qty-decrease aria-label="${window.theme.strings?.minusLabel || 'Decrease quantity'}">−</button>
        <input type="number" min="0" ${v.inventory_management ? `max="${v.inventory_quantity}"` : ''} value="0" data-qty-input>
        <button type="button" class="qty-btn" data-qty-increase aria-label="${window.theme.strings?.plusLabel || 'Increase quantity'}">＋</button>
      </div>` : 'Sold out';
    tr.innerHTML = `<td>${v.title}</td><td>${Shopify.formatMoney(v.price)}</td><td>${qtyPicker}</td><td class="bulk-row__subtotal">${Shopify.formatMoney(0)}</td>`;
    tbody.appendChild(tr);
  });
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('lock-scroll');
  releaseFocus = trapFocus(modal);
}

function closeModal(){
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('lock-scroll');
  if(releaseFocus) releaseFocus();
}

function updateTotals(cart){
  modal.querySelector('#BulkTotalItems').textContent = cart.item_count;
  modal.querySelector('#BulkSubtotal').textContent = Shopify.formatMoney(cart.total_price);
}

function updateRow(row, qty){
  const price = Number(row.dataset.price);
  row.querySelector('.bulk-row__subtotal').textContent = Shopify.formatMoney(price * qty);
}

function changeCart(id, qty, row){
  fetch('/cart/change.js',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id,quantity:qty})
  })
  .then(r=>r.json())
  .then(cart=>{
    updateRow(row, qty);
    updateTotals(cart);
    fetchSection('cart-icon-bubble');
  });
}

modal.addEventListener('click',e=>{
  if(e.target.matches('.bulk-modal__close')){closeModal();}
  if(e.target.closest('.js-view-cart')){closeModal();window.location.href='/cart';}
  if(e.target.dataset.qtyIncrease || e.target.dataset.qtyDecrease){
    const root = e.target.closest('[data-qty-root]');
    const input = root.querySelector('[data-qty-input]');
    let val = parseInt(input.value,10)||0;
    if(e.target.dataset.qtyIncrease) val++; else val = Math.max(0,val-1);
    if(input.max) val = Math.min(val, parseInt(input.max,10));
    input.value = val;
    const row = root.closest('tr');
    changeCart(row.dataset.variantId, val, row);
  }
});

modal.addEventListener('input',e=>{
  if(e.target.matches('[data-qty-input]')){
    const row = e.target.closest('tr');
    const val = parseInt(e.target.value,10)||0;
    changeCart(row.dataset.variantId, val, row);
  }
});

document.addEventListener('click',e=>{
  const btn = e.target.closest('.js-bulk-modal-open');
  if(btn){
    const handle = btn.dataset.productHandle;
    fetch(`/products/${handle}.js`).then(r=>r.json()).then(openModal);
  }
});

export {};
