// public/js/pos.js

document.addEventListener('DOMContentLoaded', function() {
  // Application state
  const state = {
    cart: [],
    taxRate: 0.08,
    selectedPaymentMethod: null
  };

  // DOM Elements
  const productsGrid = document.querySelector('.products-grid');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const cartItemsContainer = document.querySelector('.cart-items');
  const emptyCartMessage = document.querySelector('.empty-cart-message');
  const subtotalElement = document.querySelector('.subtotal-amount');
  const taxElement = document.querySelector('.tax-amount');
  const totalElement = document.querySelector('.total-amount');
  const clearCartButton = document.querySelector('.clear-cart-btn');
  const checkoutButton = document.querySelector('.checkout-btn');
  const paymentButtons = document.querySelectorAll('.payment-btn');
  const paymentModal = document.getElementById('paymentModal');
  const receiptModal = document.getElementById('receiptModal');
  const modalTotal = document.querySelector('.modal-total');
  const paymentMethodDetails = document.querySelector('.payment-method-details');
  const processPaymentButton = document.querySelector('.process-payment-btn');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const receiptContent = document.querySelector('.receipt-content');
  const printReceiptButton = document.querySelector('.print-receipt-btn');
  const newOrderButton = document.querySelector('.new-order-btn');

  // Event Listeners
  // Category filter
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter products
      const category = this.dataset.category;
      filterProducts(category);
    });
  });

  // Add product to cart
  productsGrid.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productCard = e.target.closest('.product-card');
      const productId = parseInt(productCard.dataset.id);
      addToCart(productId);
    }
  });

  // Cart item events (remove, change quantity)
  cartItemsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item-btn')) {
      const cartItem = e.target.closest('.cart-item');
      const itemId = parseInt(cartItem.dataset.id);
      removeFromCart(itemId);
    } else if (e.target.classList.contains('quantity-btn')) {
      const cartItem = e.target.closest('.cart-item');
      const itemId = parseInt(cartItem.dataset.id);
      const action = e.target.dataset.action;
      updateQuantity(itemId, action);
    }
  });

  // Clear cart
  clearCartButton.addEventListener('click', clearCart);

  // Payment selection
  paymentButtons.forEach(button => {
    button.addEventListener('click', function() {
      state.selectedPaymentMethod = this.dataset.method;
      showPaymentModal();
    });
  });

  // Process payment
  processPaymentButton.addEventListener('click', processPayment);

  // Close modals
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      paymentModal.style.display = 'none';
      receiptModal.style.display = 'none';
    });
  });

  // Print receipt
  printReceiptButton.addEventListener('click', function() {
    window.print();
  });

  // Start new order
  newOrderButton.addEventListener('click', function() {
    receiptModal.style.display = 'none';
    clearCart();
  });

  // Functions
  function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function addToCart(productId) {
    // Find the product in the products grid
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    const productName = productCard.querySelector('h3').textContent;
    const priceText = productCard.querySelector('.price').textContent;
    const productPrice = parseFloat(priceText.replace('$', ''));

    // Check if product is already in cart
    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      state.cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
        total: productPrice
      });
    }

    updateCartUI();
  }

  function removeFromCart(itemId) {
    state.cart = state.cart.filter(item => item.id !== itemId);
    updateCartUI();
  }

  function updateQuantity(itemId, action) {
    const item = state.cart.find(item => item.id === itemId);

    if (item) {
      if (action === 'increase') {
        item.quantity += 1;
      } else if (action === 'decrease') {
        item.quantity = Math.max(1, item.quantity - 1);
      }

      item.total = item.quantity * item.price;
      updateCartUI();
    }
  }

  function clearCart() {
    state.cart = [];
    updateCartUI();
  }

  function updateCartUI() {
    // Update cart items display
    if (state.cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartItemsContainer.innerHTML = '';
      cartItemsContainer.appendChild(emptyCartMessage);
      checkoutButton.disabled = true;
    } else {
      emptyCartMessage.style.display = 'none';

      let cartHTML = '';
      state.cart.forEach(item => {
        cartHTML += `
          <div class="cart-item" data-id="${item.id}">
            <div class="item-info">
              <div class="item-name">${item.name}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="item-quantity">
              <button class="quantity-btn" data-action="decrease">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" data-action="increase">+</button>
            </div>
            <div class="item-total">$${item.total.toFixed(2)}</div>
            <button class="remove-item-btn">×</button>
          </div>
        `;
      });
      
      cartItemsContainer.innerHTML = cartHTML;
      checkoutButton.disabled = false;
    }
    
    // Calculate and update totals
    const subtotal = state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
  }

  function showPaymentModal() {
    if (state.cart.length === 0) return;
    
    // Calculate total
    const subtotal = state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + tax;
    
    modalTotal.textContent = `$${total.toFixed(2)}`;
    
    // Show payment method specific UI
    if (state.selectedPaymentMethod === 'cash') {
      paymentMethodDetails.innerHTML = `
        <h3>Cash Payment</h3>
        <div class="form-group">
          <label for="cashAmount">Amount Received</label>
          <input type="number" id="cashAmount" class="payment-input" step="0.01" min="${total.toFixed(2)}">
        </div>
        <div class="change-amount" style="display: none;">
          <span>Change:</span>
          <span id="changeAmount">$0.00</span>
        </div>
      `;
      
      // Calculate change
      const cashInput = document.getElementById('cashAmount');
      const changeAmount = document.getElementById('changeAmount');
      const changeContainer = document.querySelector('.change-amount');
      
      cashInput.addEventListener('input', function() {
        const received = parseFloat(this.value) || 0;
        const change = received - total;
        
        if (change >= 0) {
          changeAmount.textContent = `$${change.toFixed(2)}`;
          changeContainer.style.display = 'block';
        } else {
          changeContainer.style.display = 'none';
        }
      });
    } else if (state.selectedPaymentMethod === 'card') {
      paymentMethodDetails.innerHTML = `
        <h3>Card Payment</h3>
        <div class="form-group">
          <label for="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" class="payment-input" placeholder="XXXX XXXX XXXX XXXX">
        </div>
        <div class="form-group">
          <label for="cardExpiry">Expiry Date</label>
          <input type="text" id="cardExpiry" class="payment-input" placeholder="MM/YY">
        </div>
        <div class="form-group">
          <label for="cardCvv">CVV</label>
          <input type="text" id="cardCvv" class="payment-input" placeholder="XXX">
        </div>
      `;
    }
    
    paymentModal.style.display = 'flex';
  }

  function processPayment() {
    // In a real app, this would connect to a payment processor
    // For demo purposes, we'll just show a receipt
    const subtotal = state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + tax;
    
    // Generate receipt
    const date = new Date().toLocaleString();
    let receiptHTML = `
      <div class="receipt-header">
        <h3>RECEIPT</h3>
        <p>Date: ${date}</p>
        <p>Order #: ${Math.floor(100000 + Math.random() * 900000)}</p>
      </div>
      <div class="receipt-items">
        <table width="100%">
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
    `;
    
    state.cart.forEach(item => {
      receiptHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${item.total.toFixed(2)}</td>
        </tr>
      `;
    });
    
    receiptHTML += `
        </table>
      </div>
      <div class="receipt-summary">
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Tax (8%): $${tax.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p>Payment Method: ${state.selectedPaymentMethod.toUpperCase()}</p>
      </div>
      <div class="receipt-footer">
        <p>Thank you for your purchase!</p>
      </div>
    `;
    
    receiptContent.innerHTML = receiptHTML;
    
    // Save order to server
    saveOrder(total);
    
    // Hide payment modal and show receipt
    paymentModal.style.display = 'none';
    receiptModal.style.display = 'flex';
  }

  function showPaymentModal() {
    if (state.cart.length === 0) return;

    // Calculate total
    const subtotal = state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + tax;

    modalTotal.textContent = `$${total.toFixed(2)}`;

    // Show payment method specific UI
    if (state.selectedPaymentMethod === 'cash') {
      paymentMethodDetails.innerHTML = `
        <h3>Cash Payment</h3>
        <div class="form-group">
          <label for="cashAmount">Amount Received</label>
          <input type="number" id="cashAmount" class="payment-input" step="0.01" min="${total.toFixed(2)}">
        </div>
        <div class="change-amount" style="display: none;">
          <span>Change:</span>
          <span id="changeAmount">$0.00</span>
        </div>
      `;

      // Calculate change
      const cashInput = document.getElementById('cashAmount');
      const changeAmount = document.getElementById('changeAmount');
      const changeContainer = document.querySelector('.change-amount');

      cashInput.addEventListener('input', function() {
        const received = parseFloat(this.value) || 0;
        const change = received - total;

        if (change >= 0) {
          changeAmount.textContent = `$${change.toFixed(2)}`;
          changeContainer.style.display = 'block';
        } else {
          changeContainer.style.display = 'none';
        }
      });
    } else if (state.selectedPaymentMethod === 'card') {
      paymentMethodDetails.innerHTML = `
        <h3>Card Payment</h3>
        <div class="form-group">
          <label for="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" class="payment-input" placeholder="XXXX XXXX XXXX XXXX">
        </div>
        <div class="form-group">
          <label for="cardExpiry">Expiry Date</label>
          <input type="text" id="cardExpiry" class="payment-input" placeholder="MM/YY">
        </div>
        <div class="form-group">
          <label for="cardCvv">CVV</label>
          <input type="text" id="cardCvv" class="payment-input" placeholder="XXX">
        </div>
      `;
    } else if (state.selectedPaymentMethod === 'promptpay') {
      // PromptPay option
      paymentMethodDetails.innerHTML = `
        <h3>PromptPay QR Code</h3>
        <div class="promptpay-container">
          <p>Scan this QR code to pay ฿${(total * 30).toFixed(2)}</p>
          <div class="qr-loading">Generating QR code...</div>
          <div id="promptpay-qr" class="qr-code"></div>
          <div class="promptpay-info">
            <p>PromptPay ID: 0812345678</p>
            <p>Recipient: Your Store Name</p>
          </div>
        </div>
      `;

      // Generate QR code - in a real app, this would call an API
      // For demo purposes, we're using a placeholder image
      setTimeout(() => {
        document.querySelector('.qr-loading').style.display = 'none';
        const qrElement = document.getElementById('promptpay-qr');
        qrElement.innerHTML = `<img src="/api/placeholder/200/200" alt="PromptPay QR Code">`;
        // In a real implementation, you would call a server endpoint that generates the QR code
        // using the qrcode library and returns it
      }, 1000);
    }

    paymentModal.style.display = 'flex';
  }

  function processPayment() {
    // In a real app, this would connect to a payment processor
    // For demo purposes, we'll just show a receipt
    const subtotal = state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + tax;

    // Generate receipt
    const date = new Date().toLocaleString();
    let receiptHTML = `
      <div class="receipt-header">
        <h3>RECEIPT</h3>
        <p>Date: ${date}</p>
        <p>Order #: ${Math.floor(100000 + Math.random() * 900000)}</p>
      </div>
      <div class="receipt-items">
        <table width="100%">
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
    `;

    state.cart.forEach(item => {
      receiptHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${item.total.toFixed(2)}</td>
        </tr>
      `;
    });

    receiptHTML += `
        </table>
      </div>
      <div class="receipt-summary">
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Tax (8%): $${tax.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p>Payment Method: ${state.selectedPaymentMethod.toUpperCase()}</p>
      </div>
    `;

    // Add PromptPay QR code to receipt if that was the payment method
    if (state.selectedPaymentMethod === 'promptpay') {
      receiptHTML += `
        <div class="receipt-promptpay">
          <h4>PromptPay QR Code</h4>
          <div class="receipt-qr-code">
            <img src="/api/placeholder/150/150" alt="PromptPay QR">
          </div>
          <p>PromptPay ID: 0812345678</p>
          <p>Amount: ฿${(total * 30).toFixed(2)}</p>
        </div>
      `;
    }

    receiptHTML += `
      <div class="receipt-footer">
        <p>Thank you for your purchase!</p>
      </div>
    `;

    receiptContent.innerHTML = receiptHTML;

    // Save order to server
    saveOrder(total);

    // Hide payment modal and show receipt
    paymentModal.style.display = 'none';
    receiptModal.style.display = 'flex';
  }
  
  function saveOrder(total) {
    // Save order to server
    const orderData = {
      items: state.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total
      })),
      total: total,
      paymentMethod: state.selectedPaymentMethod
    };
    
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Order saved:', data);
    })
    .catch(error => {
      console.error('Error saving order:', error);
    });
  }

  // Initialize the app
  updateCartUI();
});