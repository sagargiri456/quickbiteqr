document.addEventListener('DOMContentLoaded', function() {
    // Countdown Timer
    const launchDate = new Date('2025-08-01T00:00:00');;
    launchDate.setDate(launchDate.getDate() + 30);
    
    let prevTime = {};

    function updateCountdown() {
        const now = new Date();
        const diff = launchDate - now;

        const time = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };

        for (const unit in time) {
            if (time[unit] !== prevTime[unit]) {
                document.getElementById(unit).textContent = time[unit].toString().padStart(2, '0');
            }
        }

        prevTime = time;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Waitlist Popup
    const waitlistBtn = document.getElementById('waitlist-btn');
    const ctaBtn = document.getElementById('cta-btn');
    const waitlistPopup = document.getElementById('waitlist-popup');
    const closeBtn = document.querySelector('.close-btn');
    const waitlistForm = document.getElementById('waitlist-form');
    
    function openWaitlist() {
        waitlistPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    waitlistBtn.addEventListener('click', openWaitlist);
    ctaBtn.addEventListener('click', openWaitlist);
    
    closeBtn.addEventListener('click', () => {
        waitlistPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault(); // This is crucial to prevent the default page redirect
    
        const emailInput = document.getElementById('email');
        const formData = new FormData(waitlistForm);
    
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        })
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            if (data.success) { // Web3Forms returns a success flag
                alert(`Thank you! ${emailInput.value} has been added to our waitlist.`);
                waitlistForm.reset();
                waitlistPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                alert("Something went wrong. Please try again.");
            }
        })
        .catch(error => {
            alert("Oops! An error occurred. Please try again later.");
            console.error('Error submitting form:', error);
        });
    });
    
    // Customer Journey Logic
    const customerScreens = document.querySelectorAll('.customer-screen');
    let currentCustomerScreen = 0;
    let cartItems = [];
    let cartCount = 0;
    
    // Menu data
    const menuItems = {
        starters: [
            { name: "Garlic Bread", description: "With herb butter", price: "5.99", category: "starters" },
            { name: "Bruschetta", description: "Tomato, basil, balsamic", price: "7.50", category: "starters" },
            { name: "Calamari", description: "Fried, with lemon aioli", price: "12.99", category: "starters" }
        ],
        mains: [
            { name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: "14.99", category: "mains" },
            { name: "Grilled Salmon", description: "With seasonal vegetables", price: "18.99", category: "mains" },
            { name: "Beef Burger", description: "Angus beef with fries", price: "16.50", category: "mains" }
        ],
        drinks: [
            { name: "Coca-Cola", description: "Regular or diet", price: "3.50", category: "drinks" },
            { name: "Iced Tea", description: "Freshly brewed", price: "4.25", category: "drinks" },
            { name: "Craft Beer", description: "Local selection", price: "7.99", category: "drinks" }
        ]
    };
    
    // Initialize menu
    function initMenu() {
        const container = document.getElementById('menu-items-container');
        container.innerHTML = '';
        
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        const items = menuItems[activeCategory];
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.dataset.name = item.name;
            menuItem.dataset.price = item.price;
            menuItem.dataset.category = item.category;
            
            menuItem.innerHTML = `
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                </div>
                <div class="item-price">$${item.price}</div>
                <div class="quantity-selector">
                    <button class="quantity-btn minus-btn">-</button>
                    <span class="quantity-display">1</span>
                    <button class="quantity-btn plus-btn">+</button>
                </div>
            `;
            
            container.appendChild(menuItem);
            
            // Add click event to show quantity selector
            menuItem.addEventListener('click', (e) => {
                // Don't trigger if clicking on quantity buttons
                if (e.target.classList.contains('quantity-btn') || 
                    e.target.classList.contains('quantity-display')) {
                    return;
                }
                
                // Remove active class from all items
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                menuItem.classList.add('active');
                
                // Set quantity to 1 for new selection
                const quantityDisplay = menuItem.querySelector('.quantity-display');
                quantityDisplay.textContent = '1';
            });
            
            // Add events to quantity buttons
            const minusBtn = menuItem.querySelector('.minus-btn');
            const plusBtn = menuItem.querySelector('.plus-btn');
            const quantityDisplay = menuItem.querySelector('.quantity-display');
            
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                let quantity = parseInt(quantityDisplay.textContent);
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            });
            
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                let quantity = parseInt(quantityDisplay.textContent);
                quantity++;
                quantityDisplay.textContent = quantity;
            });
        });
    }
    
    // Function to show a specific customer screen
    function showCustomerScreen(index) {
        customerScreens.forEach((screen, i) => {
            if (i === index) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        currentCustomerScreen = index;
        
        // Hide quantity selectors when leaving menu screen
        if (index !== 1) {
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    }
    
    // Initialize cart
    function updateCart() {
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cart-count').textContent = cartCount;
        document.getElementById('cart-count-review').textContent = cartCount;
        
        // Update cart items in review screen
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            const emptyCart = document.createElement('div');
            emptyCart.className = 'empty-cart';
            emptyCart.style.textAlign = 'center';
            emptyCart.style.padding = '20px';
            emptyCart.style.color = 'var(--text-gray)';
            emptyCart.innerHTML = `
                <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Your cart is empty</p>
            `;
            cartItemsContainer.appendChild(emptyCart);
            return;
        }
        
        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">$${item.price}</div>
                </div>
                <div class="item-controls">
                    <button class="control-btn minus-btn">-</button>
                    <span>${item.quantity}</span>
                    <button class="control-btn plus-btn">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            
            // Add event listeners to quantity buttons
            cartItem.querySelector('.minus-btn').addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cartItems = cartItems.filter(i => i.name !== item.name);
                }
                updateCart();
            });
            
            cartItem.querySelector('.plus-btn').addEventListener('click', () => {
                item.quantity++;
                updateCart();
            });
        });
    }
    
    // Add item to cart
    function addToCart(item, quantity) {
        // Check if item already in cart
        const existingItem = cartItems.find(i => i.name === item.name);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({
                name: item.name,
                price: item.price,
                quantity: quantity
            });
        }
        
        updateCart();
        
        // Show cart badge animation
        const cartBadge = document.getElementById('cart-count');
        cartBadge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 300);
        
        // Show success animation
        const menuItem = document.querySelector(`.menu-item[data-name="${item.name}"]`);
        if (menuItem) {
            menuItem.classList.add('added');
            setTimeout(() => {
                menuItem.classList.remove('added');
                menuItem.classList.remove('active');
            }, 1000);
        }
    }
    
    // Category switching
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update menu items
            initMenu();
        });
    });
    
    // Back buttons for customer screens
    document.querySelectorAll('.customer-screen .back-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentCustomerScreen > 0) {
                showCustomerScreen(currentCustomerScreen - 1);
            }
        });
    });
    
    // Scanner screen
    document.getElementById('scanner-screen').addEventListener('click', () => {
        showCustomerScreen(1);
    });
    
    // Cart icon
    document.getElementById('cart-icon').addEventListener('click', () => {
        if (cartItems.length > 0) {
            showCustomerScreen(2);
        } else {
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.textContent = 'Your cart is empty!';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'var(--dark-panel)';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '20px';
            notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            notification.style.zIndex = '1000';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }
    });
    
    // Add to cart from menu items
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('menu-item') || 
            e.target.closest('.menu-item')) {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem.classList.contains('active')) {
                const itemName = menuItem.dataset.name;
                const category = menuItem.dataset.category;
                const price = menuItem.dataset.price;
                const quantity = parseInt(menuItem.querySelector('.quantity-display').textContent);
                
                const item = { name: itemName, price: price, category: category };
                addToCart(item, quantity);
                
                // Reset quantity selector
                menuItem.querySelector('.quantity-display').textContent = '1';
            }
        }
    });
    
    // Continue to payment (renamed to Complete the Order)
    document.getElementById('continue-to-payment').addEventListener('click', () => {
        const tableNumber = document.getElementById('table-number').value;
        if (!tableNumber) {
            alert('Please enter your table number');
            return;
        }
        
        if (cartItems.length === 0) {
            alert('Please add items to your cart first');
            return;
        }
        
        showCustomerScreen(3);
    });
    
    // Payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to selected option
            this.classList.add('active');
        });
    });
    
    // Confirm payment
    document.getElementById('confirm-payment').addEventListener('click', () => {
        // Check if payment method is selected
        const selectedMethod = document.querySelector('.payment-option.active');
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }
        
        showCustomerScreen(4);
    });
    
    // New order button
    document.getElementById('new-order-btn').addEventListener('click', () => {
        // Reset cart and go back to scanner
        cartItems = [];
        cartCount = 0;
        updateCart();
        showCustomerScreen(0);
    });
    
    // Dashboard Interactions
    const dashboardScreens = document.querySelectorAll('.dashboard-screen');
    const dashboardOptions = document.querySelectorAll('.dashboard-option');
    const statusBtns = document.querySelectorAll('.status-btn');
    const saveMenuBtn = document.getElementById('save-menu-btn');
    const qrGenerateBtn = document.getElementById('generate-qr');
    const qrContainer = document.getElementById('qr-container');
    let currentDashboardScreen = 0;
    
    // Function to show a specific dashboard screen
    function showDashboardScreen(index) {
        dashboardScreens.forEach((screen, i) => {
            if (i === index) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        currentDashboardScreen = index;
    }
    
    // Dashboard options navigation
    dashboardOptions.forEach(option => {
        option.addEventListener('click', function() {
            const screenIndex = parseInt(this.dataset.screen);
            showDashboardScreen(screenIndex);
        });
    });
    
    // Back buttons for dashboard screens
    document.querySelectorAll('.dashboard-screen .back-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            showDashboardScreen(0);
        });
    });
    
    // Order status updates
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const statuses = ['Pending', 'In Progress', 'Completed'];
            const currentStatus = btn.textContent;
            const currentIndex = statuses.indexOf(currentStatus);
            const nextIndex = (currentIndex + 1) % statuses.length;
            
            btn.textContent = statuses[nextIndex];
            btn.className = `status-btn ${statuses[nextIndex].toLowerCase().replace(' ', '-')}`;
        });
    });
    
    // Menu save confirmation
    saveMenuBtn.addEventListener('click', () => {
        const confirmation = document.createElement('div');
        confirmation.textContent = 'Menu Saved!';
        confirmation.style.position = 'absolute';
        confirmation.style.bottom = '20px';
        confirmation.style.left = '0';
        confirmation.style.right = '0';
        confirmation.style.textAlign = 'center';
        confirmation.style.color = 'var(--accent-blue)';
        confirmation.style.fontWeight = '600';
        confirmation.style.animation = 'fadeOut 2s forwards';
        saveMenuBtn.parentElement.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 2000);
    });
    
    // QR Code Generation
    qrGenerateBtn.addEventListener('click', () => {
        qrContainer.innerHTML = '';
        const qr = document.createElement('div');
        qr.style.width = '140px';
        qr.style.height = '140px';
        qr.style.backgroundColor = '#3a86ff';
        qr.style.display = 'flex';
        qr.style.alignItems = 'center';
        qr.style.justifyContent = 'center';
        qr.style.borderRadius = '10px';
        qr.style.margin = '0 auto';
        
        const qrPattern = document.createElement('div');
        qrPattern.style.width = '90px';
        qrPattern.style.height = '90px';
        qrPattern.style.backgroundImage = 'radial-gradient(black 25%, transparent 25%), radial-gradient(black 25%, transparent 25%)';
        qrPattern.style.backgroundPosition = '0 0, 8px 8px';
        qrPattern.style.backgroundSize = '16px 16px';
        qr.appendChild(qrPattern);
        
        qrContainer.appendChild(qr);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download QR';
        downloadBtn.className = 'qr-download-btn';
        qrContainer.appendChild(downloadBtn);
        
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('QR Code Downloaded!');
        });
    });
    
    // Initialize the menu
    initMenu();
});