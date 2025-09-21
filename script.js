
document.addEventListener('DOMContentLoaded', function() {
    // Elements DOM
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const main = document.querySelector('.main');
    const overlay = document.querySelector('.overlay');
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    const cartCount = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Panier
    let cart = [];
    
    // Toggle sidebar
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        main.classList.toggle('sidebar-active');
        overlay.classList.toggle('active');
    });
    
    // Fermer sidebar en cliquant sur l'overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        main.classList.remove('sidebar-active');
        overlay.classList.remove('active');
        cartModal.classList.remove('active');
    });
    
    // Toggle panier
    cartIcon.addEventListener('click', function() {
        cartModal.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // Fermer panier
    closeCart.addEventListener('click', function() {
        cartModal.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Ajouter au panier
    document.querySelectorAll('.card button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.card');
            const title = card.querySelector('h3').textContent;
            const price = parseFloat(card.querySelector('h3').textContent.match(/\d+/)[0]);
            const image = card.querySelector('img').src;
            
            addToCart(title, price, image);
        });
    });
    
    // Fonction pour ajouter au panier
    function addToCart(title, price, image) {
        const existingItem = cart.find(item => item.title === title);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                title,
                price,
                image,
                quantity: 1
            });
        }
        
        updateCart();
        
        // Animation de confirmation
        cartIcon.classList.add('pulse');
        setTimeout(() => {
            cartIcon.classList.remove('pulse');
        }, 300);
    }
    
    // Mettre à jour le panier
    function updateCart() {
        // Vider le contenu actuel
        cartItems.innerHTML = '';
        
        let total = 0;
        let count = 0;
        
        // Ajouter chaque article
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += item.quantity;
            
            const cartItemEl = document.createElement('div');
            cartItemEl.classList.add('cart-item');
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                </div>
            `;
            
            cartItems.appendChild(cartItemEl);
        });
        
        // Mettre à jour le total et le compteur
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        cartCount.textContent = count;
    }
    
    // Passer la commande
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Votre panier est vide!');
            return;
        }
        
        alert('Commande passée avec succès!');
        cart = [];
        updateCart();
        cartModal.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Animation CSS pour l'icône du panier
    const style = document.createElement('style');
    style.textContent = `
        .pulse {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});

/* ---------- Utilitaires ---------- */
    const fmt = (n) => new Intl.NumberFormat('fr-FR',{style:'currency', currency: state.currency}).format(Number(n||0));
    const money = (n) => Number(n).toFixed(2);
    
    const itemsFromCart = () => {
      return Object.entries(state.cart)
        .filter(([key]) => !key.endsWith('_type'))
        .map(([id, qty]) => {
          const product = PRODUCTS.find(p => p.id === id);
          const licenseType = state.cart[`${id}_type`] || 'pro';
          const price = product ? product.prices[licenseType] : 0;
          return {...product, qty, licenseType, price};
        });
    };
    
    const subtotalValue = () => itemsFromCart().reduce((s, it) => s + it.price * it.qty, 0);
    const supportValue = () => Number(document.getElementById('support').value || 0);
    const taxValue = () => subtotalValue() * 0.05;
    const discountValue = () => state.coupon === 'WELCOME15' ? Math.min(50, subtotalValue() * 0.15) : 0;
    const grandTotalValue = () => Math.max(0, subtotalValue() + supportValue() + taxValue() - discountValue());

    function persist(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }

    // Fonction pour afficher les notifications toast
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
      `;
      
      document.getElementById('toastContainer').appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    /* ---------- Rendu catalogue ---------- */
    function renderCatalog(){
      const el = document.getElementById('catalog');
      el.innerHTML = PRODUCTS.map(p => {
        const tagsHTML = p.tags.map(tag => `<span class="tag ${tag}">${tag.replace('tag-', '').toUpperCase()}</span>`).join('');
        const featuresHTML = p.features.map(f => `<li>${f}</li>`).join('');
        
        // Vérifier quel type de licence est sélectionné pour ce produit
        const selectedType = state.cart[`${p.id}_type`] || 'pro';
        
        return `
        <article class="item">
          <img alt="${p.name}" loading="lazy" src="${p.img}"/>
          <div class="meta">
            <div>
              <strong>${p.name}</strong>
              ${tagsHTML}
            </div>
            <div class="muted">${p.description}</div>
            
            <ul class="feature-list">
              ${featuresHTML}
            </ul>
            
            <div class="license-type">
              <div class="license-option license-basic ${selectedType === 'basic' ? 'selected' : ''}" onclick="selectLicense('${p.id}', 'basic')">
                <div>Basique</div>
                <div class="price">${fmt(p.prices.basic)}</div>
              </div>
              <div class="license-option license-pro ${selectedType === 'pro' ? 'selected' : ''}" onclick="selectLicense('${p.id}', 'pro')">
                <div>Pro</div>
                <div class="price">${fmt(p.prices.pro)}</div>
              </div>
              <div class="license-option license-enterprise ${selectedType === 'enterprise' ? 'selected' : ''}" onclick="selectLicense('${p.id}', 'enterprise')">
                <div>Enterprise</div>
                <div class="price">${fmt(p.prices.enterprise)}</div>
              </div>
            </div>
            
            <div class="row" style="margin-top:8px">
              <button class="btn" onclick="addToCart('${p.id}')"><i class="fas fa-cart-plus"></i> Ajouter au panier</button>
            </div>
          </div>
        </article>
      `}).join('');
    }

    function selectLicense(productId, licenseType) {
      // Mettre à jour visuellement la sélection
      const productElement = document.querySelector(`.item [onclick*="${productId}"]`).closest('.item');
      const options = productElement.querySelectorAll('.license-option');
      options.forEach(opt => opt.classList.remove('selected'));
      productElement.querySelector(`.license-option[onclick*="${productId}', '${licenseType}')"]`).classList.add('selected');
      
      // Stocker le type de licence sélectionné
      state.cart[`${productId}_type`] = licenseType;
      persist();
      
      // Si le produit est déjà dans le panier, mettre à jour le prix
      if (state.cart[productId]) {
        renderCart();
        showToast('Type de licence mis à jour', 'success');
      }
    }

    /* ---------- Rendu panier ---------- */
    function renderCart(){
      const el = document.getElementById('cart');
      const items = itemsFromCart();
      const count = items.reduce((s,i)=>s+i.qty,0);
      document.getElementById('cartCount').textContent = count + (count>1?' licences':' licence');
      
      if(items.length===0){
        el.innerHTML = '<div class="muted" style="text-align:center;padding:2rem"><i class="fas fa-shopping-cart" style="font-size:2rem;margin-bottom:1rem;opacity:0.5"></i><br>Votre panier est vide.</div>';
      } else {
        el.innerHTML = items.map(it => `
          <div class="cart-line">
            <div>
              <strong>${it.name}</strong>
              <div class="muted">${it.licenseType.toUpperCase()} - ${fmt(it.price)} × ${it.qty}</div>
            </div>
            <div style="text-align:right;font-weight:600">${fmt(it.price*it.qty)}</div>
            <div style="text-align:right" class="qty">
              <button class="btn-ghost" onclick="dec('${it.id}')">−</button>
              <span style="min-width:2rem;text-align:center">${it.qty}</span>
              <button class="btn" onclick="inc('${it.id}')">+</button>
            </div>
          </div>
        `).join('');
      }
      recalc();
    }

    function recalc(){
      document.getElementById('subtotal').textContent = fmt(subtotalValue());
      document.getElementById('tax').textContent = fmt(taxValue());
      document.getElementById('discount').textContent = '− ' + fmt(discountValue());
      document.getElementById('grandTotal').textContent = fmt(grandTotalValue());
      
      // Mettre à jour le bouton PayPal si le SDK est chargé
      if(state.sdkLoaded && window.paypal && state.buttons){
        try {
          if(subtotalValue() <= 0){
            state.buttons.close();
            document.getElementById('paypal-button-container').innerHTML = '';
            setStatus('Ajoutez des produits pour payer', false);
          } else {
            renderPayPalButtons();
          }
        } catch(e) {
          console.error("Erreur de mise à jour des boutons PayPal:", e);
        }
      }
    }

    function addToCart(id, qty=1){ 
      // Récupérer le type de licence sélectionné
      const licenseType = state.cart[`${id}_type`] || 'pro';
      state.cart[`${id}_type`] = licenseType;
      state.cart[id] = (state.cart[id]||0) + qty; 
      persist(); 
      renderCart();
      
      const product = PRODUCTS.find(p => p.id === id);
      showToast(`${product.name} ajouté au panier`, 'success');
    }
    
    function inc(id){ 
      addToCart(id,1); 
    }
    
    function dec(id){ 
      if(!state.cart[id]) return; 
      state.cart[id]-=1; 
      if(state.cart[id]<=0) delete state.cart[id]; 
      persist(); 
      renderCart(); 
      
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        showToast(`${product.name} retiré du panier`, 'warning');
      }
    }

    function applyCoupon(){
      const code = (document.getElementById('coupon').value||'').trim().toUpperCase();
      const oldCoupon = state.coupon;
      state.coupon = code === 'WELCOME15' ? code : null;
      
      if (state.coupon && !oldCoupon) {
        showToast('Code promo appliqué avec succès!', 'success');
      } else if (!state.coupon && oldCoupon) {
        showToast('Code promo retiré', 'warning');
      } else if (code && !state.coupon) {
        showToast('Code promo invalide', 'error');
      }
      
      recalc();
    }

    /* ---------- PayPal ---------- */
    function setStatus(msg, ok){ 
      const s = document.getElementById('paypal-status'); 
      s.textContent = msg; 
      s.className = ok ? 'ok' : 'err'; 
    }

    function loadPayPalSdk(){
      state.sdkLoaded = false;
      if(state.buttons){ try{ state.buttons.close(); }catch(e){} state.buttons=null; }
      document.getElementById('paypal-button-container').innerHTML = '';
      const old = document.getElementById('paypal-sdk');
      if(old) old.remove();
      setStatus('Chargement du système de paiement...', true);
      const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(state.clientId)}&currency=${encodeURIComponent(state.currency)}&components=buttons`;
      const s = document.createElement('script');
      s.id = 'paypal-sdk';
      s.src = src;
      s.async = true;
      s.onload = () => { 
        state.sdkLoaded = true; 
        setStatus('Système de paiement prêt ✔︎', true); 
        renderPayPalButtons(); 
      };
      s.onerror = () => { 
        setStatus('Échec de chargement du système de paiement.', false); 
        showToast('Impossible de charger PayPal. Veuillez réessayer.', 'error');
      };
      document.head.appendChild(s);
    }

    function toPayPalItems(){
      return itemsFromCart().map(it => ({
        name: `${it.name} (${it.licenseType.toUpperCase()})`,
        unit_amount: { value: money(it.price), currency_code: state.currency },
        quantity: String(it.qty)
      }));
    }

    function validateBillingInfo() {
      const fn = document.getElementById('fn').value.trim();
      const ln = document.getElementById('ln').value.trim();
      const email = document.getElementById('email').value.trim();
      
      if (!fn || !ln) {
        showToast('Veuillez saisir votre prénom et nom', 'error');
        return false;
      }
      
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        showToast('Veuillez saisir une adresse email valide', 'error');
        return false;
      }
      
      return true;
    }

    function renderPayPalButtons(){
      if(!window.paypal){ 
        setStatus('Système de paiement indisponible.', false); 
        return; 
      }
      
      const container = document.getElementById('paypal-button-container');
      container.innerHTML = '';
      
      if (subtotalValue() <= 0) {
        setStatus('Ajoutez des produits pour payer', false);
        return;
      }
      
      state.buttons = window.paypal.Buttons({
        style: { 
          layout: 'vertical', 
          shape: 'pill', 
          color: 'blue',
          label: 'pay',
          height: 45
        },
        
        onInit: function(data, actions){
          if(subtotalValue() <= 0){ 
            actions.disable(); 
          } else { 
            actions.enable(); 
          }
        },
        
        onClick: function() {
          // Valider les informations de facturation avant le paiement
          if (!validateBillingInfo()) {
            return false;
          }
        },
        
        createOrder: function(data, actions){
          const total = money(grandTotalValue());
          if(parseFloat(total) <= 0){ 
            showToast('Ajoutez des licences au panier.', 'error'); 
            return; 
          }
          
          const breakdown = {
            item_total: { value: money(subtotalValue()), currency_code: state.currency },
            handling:   { value: money(supportValue()), currency_code: state.currency },
            tax_total:  { value: money(taxValue()), currency_code: state.currency },
            discount: { value: money(discountValue()), currency_code: state.currency }
          };
          
          return actions.order.create({
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW'
            },
            purchase_units: [{
              amount: { 
                currency_code: state.currency, 
                value: total, 
                breakdown 
              },
              items: toPayPalItems(),
              payee: { email_address: "votre-email-business@dramtech.com" },
              description: "Licences logicielles DramTech",
              custom_id: "ORDER_" + Date.now()
            }]
          });
        },
        
        onApprove: function(data, actions){
          setStatus('Traitement du paiement... <span class="loading"></span>', true);
          
          return actions.order.capture().then(function(details){
            setStatus('Paiement réussi! ✔︎', true);
            
            // Réinitialiser le panier après paiement réussi
            state.cart = {};
            state.coupon = null;
            persist();
            renderCart();
            document.getElementById('coupon').value = '';
            
            // Afficher le récapitulatif de la commande
            showToast(`Paiement confirmé! Merci ${details.payer.name.given_name}.`, 'success');
            
            console.log('Transaction complète:', details);
          }).catch(function(err){
            setStatus('Erreur lors du traitement du paiement.', false);
            showToast('Erreur lors du traitement du paiement.', 'error');
            console.error('Erreur PayPal:', err);
          });
        },
        
        onCancel: function(data){
          setStatus('Paiement annulé.', false);
          showToast('Paiement annulé', 'warning');
        },
        
        onError: function(err){
          setStatus('Erreur système.', false);
          showToast('Erreur système lors du paiement', 'error');
          console.error('Erreur PayPal:', err);
        }
      });
      
      state.buttons.render('#paypal-button-container').catch(function(err){
        console.error('Erreur de rendu des boutons PayPal:', err);
        setStatus('Impossible d\'initialiser le paiement.', false);
      });
    }

    /* ---------- Initialisation ---------- */
    function init(){
      renderCatalog();
      renderCart();
      loadPayPalSdk();
      
      // Vérifier si un code promo est déjà dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const couponCode = urlParams.get('coupon');
      if (couponCode) {
        document.getElementById('coupon').value = couponCode;
        applyCoupon();
      }
    }

    // Initialiser l'application au chargement
    window.onload = init;