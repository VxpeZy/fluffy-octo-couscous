// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const addProductBtn = document.querySelector('.add-product-btn');
  const productModal = document.getElementById('productModal');
  const orderDetailsModal = document.getElementById('orderDetailsModal');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const productForm = document.getElementById('productForm');
  const productList = document.querySelector('.product-list tbody');
  const orderList = document.querySelector('.order-list tbody');
  const orderDetails = document.getElementById('orderDetails');

  // Event Listeners
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Show active tab content
      const tabId = this.dataset.tab + '-tab';
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });

  // Open product modal
  addProductBtn.addEventListener('click', function() {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    productForm.reset();
    productForm.dataset.mode = 'add';
    productModal.style.display = 'flex';
  });

  // Close modals
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      productModal.style.display = 'none';
      orderDetailsModal.style.display = 'none';
    });
  });

  // Submit product form
  productForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('productName').value,
      price: parseFloat(document.getElementById('productPrice').value),
      category: document.getElementById('productCategory').value
    };

    if (this.dataset.mode === 'add') {
      addProduct(formData);
    } else if (this.dataset.mode === 'edit') {
      const productId = parseInt(this.dataset.productId);
      updateProduct(productId, formData);
    }

    productModal.style.display = 'none';
  });

  // Edit product button click
  productList.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
      const productId = parseInt(e.target.dataset.id);
      editProduct(productId);
    } else if (e.target.classList.contains('delete-btn')) {
      const productId = parseInt(e.target.dataset.id);
      if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(productId);
      }
    }
  });

  // View order details
  orderList.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-btn')) {
      const orderId = parseInt(e.target.dataset.id);
      viewOrderDetails(orderId);
    }
  });

  // Functions
  function addProduct(productData) {
    // In a real app, this would be an API call
    // For demo purposes we'll reload the page
    alert('Product added successfully!');
    window.location.reload();
  }

  function editProduct(productId) {
    // In a real app, this would fetch product details from API
    // For demo purposes, we'll get it from the table
    const productRow = document.querySelector(`button.edit-btn[data-id="${productId}"]`).closest('tr');
    const name = productRow.cells[1].textContent;
    const price = parseFloat(productRow.cells[2].textContent.replace('$', ''));
    const category = productRow.cells[3].textContent;

    // Populate the form
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = name;
    document.getElementById('productPrice').value = price;
    document.getElementById('productCategory').value = category;

    productForm.dataset.mode = 'edit';
    productForm.dataset.productId = productId;

    productModal.style.display = 'flex';
  }

  function updateProduct(productId, productData) {
    // In a real app, this would be an API call
    // For demo purposes we'll reload the page
    alert('Product updated successfully!');
    window.location.reload();
  }

  function deleteProduct(productId) {
    // In a real app, this would be an API call
    // For demo purposes we'll reload the page
    alert('Product deleted successfully!');
    window.location.reload();
  }

  function viewOrderDetails(orderId) {
    // In a real app, this would fetch order details from API
    // For demo purposes, we'll use a dummy order
    fetch(`/api/orders/${orderId}`)
      .then(response => {
        // If we can't get the order from API, generate dummy data
        // This is just for the demo
        const orderRow = document.querySelector(`button.view-btn[data-id="${orderId}"]`).closest('tr');
        const orderDate = orderRow.cells[1].textContent;
        const orderTotal = orderRow.cells[3].textContent;
        const paymentMethod = orderRow.cells[4].textContent;

        const dummyItems = [
          { name: 'Coffee', price: 3.50, quantity: 2, total: 7.00 },
          { name: 'Sandwich', price: 6.75, quantity: 1, total: 6.75 }
        ];

        let detailsHTML = `
          <div class="order-info">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>
          <div class="order-items">
            <h3>Items</h3>
            <table width="100%">
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
        `;

        dummyItems.forEach(item => {
          detailsHTML += `
            <tr>
              <td>${item.name}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>$${item.total.toFixed(2)}</td>
            </tr>
          `;
        });

        detailsHTML += `
            </table>
          </div>
          <div class="order-summary">
            <p><strong>Subtotal:</strong> $${(parseFloat(orderTotal.replace('$', '')) * 0.92).toFixed(2)}</p>
            <p><strong>Tax (8%):</strong> $${(parseFloat(orderTotal.replace('$', '')) * 0.08).toFixed(2)}</p>
            <p><strong>Total:</strong> ${orderTotal}</p>
          </div>
        `;

        orderDetails.innerHTML = detailsHTML;
        orderDetailsModal.style.display = 'flex';
      });
  }
});