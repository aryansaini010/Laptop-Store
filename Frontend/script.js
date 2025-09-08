// script.js (Comprehensive Frontend Logic)

document.addEventListener('DOMContentLoaded', function() {
    // Base URL for your backend API
    const API_BASE_URL = 'https://laptop-store-backend.onrender.com'; // Make sure this matches your backend server URL

    // --- Global Helper Functions for Messages ---

    /**
     * Displays a temporary message in a specific HTML element.
     * Used for inline form messages or small notifications.
     * @param {string} elementId - The ID of the HTML element to display the message in.
     * @param {string} message - The message text.
     * @param {boolean} isError - True for error (red text), false for success (green text).
     */
    function displayMessage(elementId, message, isError = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            // Using CSS variables for color, with fallbacks
            element.style.color = isError ? 'var(--error-color, red)' : 'var(--primary-color, green)';
            element.style.display = message ? 'block' : 'none';
        }
    }

    /**
     * Clears a message from a specific HTML element.
     * @param {string} elementId - The ID of the HTML element.
     */
    function clearMessage(elementId) {
        displayMessage(elementId, '', false);
    }

    /**
     * Displays a global, custom modal message (replaces browser's alert()).
     * @param {string} message - The message to display in the modal.
     */
    function showModalMessage(message) {
        // Remove any existing modals to prevent duplicates
        const existingModal = document.getElementById('customModalOverlay');
        if (existingModal) existingModal.remove();

        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'customModalOverlay'; // Add an ID for easy removal
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: #fff;
            padding: 25px 35px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            text-align: center;
            font-family: 'Inter', sans-serif;
            color: #333;
            max-width: 400px;
            width: 90%;
            box-sizing: border-box;
            position: relative;
            animation: fadeIn 0.3s ease-out;
        `;

        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messageParagraph.style.cssText = `
            font-size: 1.1em;
            margin-bottom: 20px;
            line-height: 1.5;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = 'OK';
        closeButton.style.cssText = `
            background-color: #4CAF50;
            color: white;
            padding: 10px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s ease, transform 0.2s ease;
        `;
        closeButton.onmouseover = () => closeButton.style.backgroundColor = '#45a049';
        closeButton.onmouseout = () => closeButton.style.backgroundColor = '#4CAF50';
        closeButton.onmousedown = () => closeButton.style.transform = 'scale(0.98)';
        closeButton.onmouseup = () => closeButton.style.transform = 'scale(1)';


        closeButton.addEventListener('click', () => {
            modalOverlay.remove();
        });

        modalContent.appendChild(messageParagraph);
        modalContent.appendChild(closeButton);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Add simple fade-in animation (ensure this style is only added once or managed via CSS)
        if (!document.getElementById('fadeInAnimation')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'fadeInAnimation';
            styleSheet.type = 'text/css';
            styleSheet.innerText = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    // --- Global cartMessages element and displayCartMessage function ---
    // Moved these outside page-specific blocks to ensure global accessibility.
    const cartMessages = document.getElementById('cart-messages'); // Get this globally if it exists

    /**
     * Displays a temporary message specifically in the cart message area.
     * @param {string} message - The message to display.
     * @param {boolean} isError - True if it's an error message (red), false for success (green).
     */
    function displayCartMessage(message, isError = true) {
        if (cartMessages) { // Check if the element exists
            cartMessages.textContent = message;
            cartMessages.style.color = isError ? 'var(--error-color, red)' : 'var(--primary-color, green)';
            cartMessages.style.display = message ? 'block' : 'none';
            setTimeout(() => cartMessages.style.display = 'none', 3000); // Hide after 3 seconds
        }
    }

    /**
     * Displays a global, temporary message in the 'global-message-area'.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' for green, 'error' for red.
     */
    function displayGlobalMessage(message, type = 'success') {
        const globalMessageArea = document.getElementById('global-message-area');
        if (globalMessageArea) {
            globalMessageArea.textContent = message;
            globalMessageArea.style.color = type === 'success' ? 'var(--primary-color, green)' : 'var(--error-color, red)';
            globalMessageArea.style.display = 'block';
            setTimeout(() => {
                globalMessageArea.textContent = '';
                globalMessageArea.style.display = 'none';
            }, 3000); // Hide after 3 seconds
        }
    }


    // --- Password Toggle Functionality (Used in forms) ---
    function setupPasswordToggle(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleId);

        if (passwordInput && toggleIcon) {
            // Position the icon after layout is stable
            setTimeout(() => {
                const inputRect = passwordInput.getBoundingClientRect();
                const parentRect = passwordInput.parentElement.getBoundingClientRect();
                // Calculate top relative to the parent, then center vertically
                toggleIcon.style.top = `${inputRect.top - parentRect.top + inputRect.height / 2}px`;
                toggleIcon.style.transform = `translateY(-50%)`;
                toggleIcon.style.right = '15px'; // Fixed right position
                toggleIcon.style.display = 'block'; // Ensure it's visible
            }, 0);

            toggleIcon.addEventListener('click', function () {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.className = type === 'password' ? 'fas fa-eye password-toggle-icon' : 'fas fa-eye-slash password-toggle-icon';
            });
        }
    }

    // --- Common Header & Footer UI Logic (Applied to all pages) ---
    const userActions = document.getElementById('userActions');
    const userDropdown = userActions ? userActions.querySelector('.user-dropdown') : null;
    const dropdownContent = userDropdown ? userDropdown.querySelector('.dropdown-content') : null;
    const userNameDisplay = document.getElementById('userNameDisplay');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartQuantityElement = document.getElementById('cart-quantity');
    const wishlistQuantityElement = document.getElementById('wishlist-quantity');
    // const globalMessageArea = document.getElementById('global-message-area'); // Already defined implicitly by displayGlobalMessage
    const userInitialIcon = document.getElementById('userInitialIcon');

    function updateAuthUI() {
        const loggedOutView = document.querySelector('[data-user-area="logged-out"]');
        const loggedInView = document.querySelector('[data-user-area="logged-in"]');
        const storedUser = JSON.parse(localStorage.getItem('user')); // Changed from 'loggedInUser'
        const token = localStorage.getItem('token');

        if (storedUser && storedUser.name && storedUser.email && token) {
            if (loggedOutView) loggedOutView.style.display = 'none';
            if (loggedInView) loggedInView.style.display = 'flex'; // Use flex for alignment
            if (userNameDisplay) userNameDisplay.textContent = `Welcome, ${storedUser.name.split(' ')[0]}`;
            if (dropdownUserName) dropdownUserName.textContent = `Name: ${storedUser.name}`;
            if (dropdownUserEmail) dropdownUserEmail.textContent = `Email: ${storedUser.email}`;
            if (userInitialIcon) userInitialIcon.textContent = storedUser.name.charAt(0).toUpperCase();

            // Display Admin Dashboard link if user is admin
            const adminDashboardLink = document.getElementById('adminDashboardLink');
            if (adminDashboardLink) {
                if (storedUser.isAdmin) { // Check the isAdmin flag from localStorage
                    adminDashboardLink.style.display = 'block'; // Show the link
                } else {
                    adminDashboardLink.style.display = 'none'; // Hide if not admin
                }
            }

        } else {
            if (loggedOutView) loggedOutView.style.display = 'flex';
            if (loggedInView) loggedInView.style.display = 'none';
            // Reset display if no user is logged in
            if (userNameDisplay) userNameDisplay.textContent = 'Welcome, User';
            if (userInitialIcon) userInitialIcon.textContent = 'U';
            if (dropdownUserName) dropdownUserName.textContent = '';
            if (dropdownUserEmail) dropdownUserEmail.textContent = '';
            // Hide Admin Dashboard link if not logged in
            const adminDashboardLink = document.getElementById('adminDashboardLink');
            if (adminDashboardLink) {
                adminDashboardLink.style.display = 'none';
            }
        }
    }

    // Toggle user dropdown
    if (userDropdown) {
        userDropdown.addEventListener('click', function(event) {
            if (dropdownContent) {
                dropdownContent.classList.toggle('show');
                const arrow = userDropdown.querySelector('.dropdown-arrow');
                if (dropdownContent.classList.contains('show')) {
                    arrow.style.transform = 'rotate(180deg)';
                } else {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
            event.stopPropagation(); // Prevent click from bubbling to document
        });
    }

    // Close dropdown if clicked outside
    document.addEventListener('click', function(event) {
        if (dropdownContent && userDropdown && !userDropdown.contains(event.target)) {
            dropdownContent.classList.remove('show');
            const arrow = userDropdown.querySelector('.dropdown-arrow');
            if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
            }
        }
    });

    // Logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('user'); // Changed from 'loggedInUser'
            localStorage.removeItem('token'); // IMPORTANT: Remove JWT token on logout
            updateAuthUI(); // Update UI to logged-out state
            updateCartIconQuantity(); // Update cart icon (will show 0 as no token)
            updateWishlistIconQuantity(); // Update wishlist icon
            console.log('User logged out.');
            window.location.href = 'index.html'; // Redirect to homepage after logout
        });
    }

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const categoryNav = document.getElementById('categoryNav');
    if (mobileMenuButton && categoryNav) {
        mobileMenuButton.addEventListener('click', function() {
            categoryNav.classList.toggle('active');
            this.classList.toggle('active'); // Add/remove active class to button itself
        });
    }

    // Active link highlighting in category nav
    function highlightActiveNavLink() {
        const currentPath = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.category-nav .nav-links a');

        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove active from all first
            const linkHref = link.getAttribute('href').split('/').pop();

            if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
        });
    }


    // Cart Quantity Badge Update (Fetches from Backend)
    async function updateCartIconQuantity() {
        const token = localStorage.getItem('token');
        if (!token) {
            // If not logged in, cart quantity is 0
            if (cartQuantityElement) {
                cartQuantityElement.textContent = '0';
                cartQuantityElement.style.display = 'none';
            }
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                const cartItems = await response.json();
                const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                if (cartQuantityElement) {
                    if (totalQuantity > 0) {
                        cartQuantityElement.textContent = totalQuantity;
                        cartQuantityElement.style.display = 'flex'; // Use flex for centering
                    } else {
                        cartQuantityElement.style.display = 'none';
                    }
                }
            } else {
                // If fetching cart fails (e.g., invalid token), display 0
                console.error('Failed to fetch cart for icon quantity:', await response.json());
                if (cartQuantityElement) {
                    cartQuantityElement.textContent = '0';
                    cartQuantityElement.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Network error fetching cart for icon quantity:', error);
            if (cartQuantityElement) {
                cartQuantityElement.textContent = '0';
                cartQuantityElement.style.display = 'none';
            }
        }
    }

    // Wishlist Quantity Badge Update (Fetches from Backend)
    async function updateWishlistIconQuantity() {
        const token = localStorage.getItem('token');
        if (!token) {
            if (wishlistQuantityElement) {
                wishlistQuantityElement.textContent = '0';
                wishlistQuantityElement.style.display = 'none';
            }
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/wishlist`, { // Assuming a /api/wishlist endpoint
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                const wishlistItems = await response.json();
                const totalQuantity = wishlistItems.length;
                if (wishlistQuantityElement) {
                    if (totalQuantity > 0) {
                        wishlistQuantityElement.textContent = totalQuantity;
                        wishlistQuantityElement.style.display = 'flex'; // Use flex for centering
                    } else {
                        wishlistQuantityElement.style.display = 'none';
                    }
                }
            } else {
                console.error('Failed to fetch wishlist for icon quantity:', await response.json());
                if (wishlistQuantityElement) {
                    wishlistQuantityElement.textContent = '0';
                    wishlistQuantityElement.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Network error fetching wishlist for icon quantity:', error);
            if (wishlistQuantityElement) {
                wishlistQuantityElement.textContent = '0';
                wishlistQuantityElement.style.display = 'none';
            }
        }
    }

    // Initial calls for global UI elements (run on all pages)
    updateAuthUI();
    updateCartIconQuantity(); // Call async function
    updateWishlistIconQuantity(); // Call async function
    highlightActiveNavLink();


    // --- Page-Specific Logic ---

    // Logic for index.html (Home Page)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Hero Slider Functionality
        const slides = document.querySelectorAll('.hero-slider .slide');
        const prevBtn = document.querySelector('.slider-nav .prev-btn');
        const nextBtn = document.querySelector('.slider-nav .next-btn');
        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function startSlider() {
            if (slides.length > 1) { // Only start if there's more than one slide
                if (slideInterval) clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
                startSlider(); // Restart interval on manual navigation
            });
        }

        // Corrected the missing closing brace and logic for nextBtn
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startSlider(); // Restart interval on manual navigation
            });
        }

        if (slides.length > 0) {
            showSlide(currentSlide); // Show initial slide
            startSlider(); // Start auto-play
        }

        // Add to Cart Button Logic on Home Page (Now interacts with Backend)
        document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async function(event) {
                event.preventDefault(); // Prevent default button behavior

                console.log('Add to Cart button clicked!'); // Debug log

                const productId = this.dataset.productId;
                const productName = this.dataset.productName;
                const productPrice = parseFloat(this.dataset.productPrice);
                const productImage = this.dataset.productImage;
                const productSpecs = this.dataset.productSpecs;
                const quantity = 1; // Default quantity when adding from product card

                console.log('Product data from button:', { productId, productName, productPrice, productImage, productSpecs, quantity }); // Debug log

                const token = localStorage.getItem('token');
                console.log('Token present for cart add:', !!token); // Debug log

                if (!token) {
                    showModalMessage('Please log in to add products to your cart.');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/cart/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({
                            productId,
                            productName,
                            productPrice,
                            productImage,
                            productSpecs,
                            quantity
                        })
                    });

                    const data = await response.json();
                    console.log('Cart add API response:', data); // Debug log

                    if (response.ok) {
                        displayGlobalMessage(`${productName} added to cart!`, 'success');
                        updateCartIconQuantity(); // Update the cart icon in header (fetches from backend)
                    } else {
                        displayGlobalMessage(data.message || 'Failed to add product to cart.', 'error');
                        console.error('Error adding to cart:', data.error || data.message);
                    }
                } catch (error) {
                    console.error('Network error adding to cart:', error);
                    displayGlobalMessage('An error occurred. Please try again later.', 'error');
                }
            });
        });

        // Add to Wishlist Button Logic on Home Page (Now interacts with Backend)
        document.querySelectorAll('.product-card .action-btn.wishlist-btn').forEach(button => {
            button.addEventListener('click', async function(event) {
                event.preventDefault();
                console.log('Add to Wishlist button clicked!'); // Debug log

                const productId = this.dataset.productId;
                const productName = this.dataset.productName;
                const productImage = this.dataset.productImage;
                const productPrice = parseFloat(this.dataset.productPrice); // Get price from data attribute
                const productCategory = this.dataset.productCategory; // Get category from data attribute

                console.log('Wishlist product data from button:', { productId, productName, productImage, productPrice, productCategory }); // Debug log

                const token = localStorage.getItem('token');
                console.log('Token present for wishlist add:', !!token); // Debug log

                if (!token) {
                    showModalMessage('Please log in to add products to your wishlist.');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, { // Assuming a new backend endpoint
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({
                            productId,
                            productName,
                            productImage,
                            productPrice, // Include price
                            productCategory // Include category
                        })
                    });

                    const data = await response.json();
                    console.log('Wishlist add API response:', data); // Debug log

                    if (response.ok) {
                        displayGlobalMessage(`${productName} added to wishlist!`, 'success');
                        updateWishlistIconQuantity(); // Update wishlist icon in header (fetches from backend)
                    } else {
                        displayGlobalMessage(data.message || `Failed to add ${productName} to wishlist.`, 'error');
                    }
                } catch (error) {
                    console.error('Network error adding to wishlist:', error);
                    displayGlobalMessage('An error occurred. Please try again later.', 'error');
                }
            });
        });
    }

    // Logic for login.html
    if (window.location.pathname.includes('login.html')) {
        setupPasswordToggle('login-password', 'toggleLoginPassword');

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                let isValid = true;
                const emailInput = document.getElementById('login-email');
                const passwordInput = document.getElementById('login-password');

                clearMessage('login-email-error');
                clearMessage('login-password-error');
                clearMessage('login-form-message'); // Clear previous form message

                if (!emailInput.value.trim()) {
                    displayMessage('login-email-error', 'Email is required.');
                    isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
                    displayMessage('login-email-error', 'Please enter a valid email address.');
                    isValid = false;
                }

                if (!passwordInput.value.trim()) {
                    displayMessage('login-password-error', 'Password is required.');
                    isValid = false;
                } else if (passwordInput.value.length < 6) {
                    displayMessage('login-password-error', 'Password must be at least 6 characters long.');
                    isValid = false;
                }

                if (isValid) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: emailInput.value.trim(),
                                password: passwordInput.value.trim()
                            })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            localStorage.setItem('token', data.token); // Store JWT token
                            // Store user info including isAdmin flag
                            localStorage.setItem('user', JSON.stringify({
                                name: data.user.name,
                                email: data.user.email,
                                isAdmin: data.user.isAdmin || false // Store isAdmin flag, default to false
                            }));
                            showModalMessage('Login successful! Redirecting...');
                            setTimeout(() => {
                                window.location.href = 'index.html'; // Redirect to homepage
                            }, 1500);
                        } else {
                            showModalMessage(data.message || 'Login failed. Invalid credentials.');
                            displayMessage('login-form-message', data.message || 'Login failed.', true);
                        }
                    } catch (error) {
                        console.error('Login API error:', error);
                        showModalMessage('An error occurred during login. Please try again.');
                        displayMessage('login-form-message', 'Network error. Please try again.', true);
                    }
                } else {
                    displayMessage('login-form-message', 'Please correct the errors above.', true);
                }
            });
        }
    }

    // Logic for signup.html
    if (window.location.pathname.includes('signup.html')) {
        setupPasswordToggle('signup-password', 'toggleSignupPassword');
        setupPasswordToggle('signup-confirm-password', 'toggleConfirmPassword');

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                let isValid = true;
                const nameInput = document.getElementById('signup-name');
                const emailInput = document.getElementById('signup-email');
                const passwordInput = document.getElementById('signup-password');
                const confirmPasswordInput = document.getElementById('signup-confirm-password');

                clearMessage('signup-name-error');
                clearMessage('signup-email-error');
                clearMessage('signup-password-error');
                clearMessage('signup-confirm-password-error');
                clearMessage('signup-form-message');

                if (!nameInput.value.trim()) {
                    displayMessage('signup-name-error', 'Name is required.');
                    isValid = false;
                }

                if (!emailInput.value.trim()) {
                    displayMessage('signup-email-error', 'Email is required.');
                    isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
                    displayMessage('signup-email-error', 'Please enter a valid email address.');
                    isValid = false;
                }

                if (!passwordInput.value.trim()) {
                    displayMessage('signup-password-error', 'Password is required.');
                    isValid = false;
                } else if (passwordInput.value.length < 6) {
                    displayMessage('signup-password-error', 'Password must be at least 6 characters long.');
                    isValid = false;
                }

                if (passwordInput.value !== confirmPasswordInput.value) {
                    displayMessage('signup-confirm-password-error', 'Passwords do not match.');
                    isValid = false;
                }

                if (isValid) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/register`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: nameInput.value.trim(),
                                email: emailInput.value.trim(),
                                password: passwordInput.value.trim()
                            })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            showModalMessage('Registration successful! Redirecting to login...');
                            setTimeout(() => {
                                window.location.href = 'login.html'; // Redirect to login page
                            }, 1500);
                        } else {
                            showModalMessage(data.message || 'Registration failed. User might already exist or server error.');
                            displayMessage('signup-form-message', data.message || 'Registration failed.', true);
                        }
                    } catch (error) {
                        console.error('Signup API error:', error);
                        showModalMessage('An error occurred during registration. Please try again.');
                        displayMessage('signup-form-message', 'Network error. Please try again.', true);
                    }
                } else {
                    displayMessage('signup-form-message', 'Please correct the errors above.', true);
                }
            });
        }
    }

    // Logic for add_to_cart.html (Cart Display Page - Now interacts with Backend)
    if (window.location.pathname.includes('add_to_cart.html')) {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartSubtotalSpan = document.getElementById('cart-subtotal');
        const cartShippingSpan = document.getElementById('cart-shipping');
        const cartTaxSpan = document.getElementById('cart-tax');
        const cartTotalSpan = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message'); // Changed ID
        const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');


        /**
         * Fetches cart items from the backend API and renders them on the page.
         * Also updates cart summary (subtotal, shipping, tax, total).
         */
        async function loadCartItems() {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, user is not logged in, cart is empty or inaccessible
                cartItemsContainer.innerHTML = '';
                emptyCartMessage.style.display = 'block';
                if (proceedToCheckoutBtn) {
                    proceedToCheckoutBtn.disabled = true;
                    proceedToCheckoutBtn.classList.add('disabled');
                }
                // Hide the header if cart is empty
                const header = document.querySelector('.cart-header');
                if (header) header.style.display = 'none';
                updateCartSummary([], 0); // Update summary with empty values
                showModalMessage('Please log in to view your cart.'); // Inform user
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });

                const cartItems = await response.json();

                if (!response.ok) {
                    // If backend returns an error (e.g., token invalid), treat as empty cart
                    showModalMessage(cartItems.message || 'Failed to load cart. Please log in again.');
                    cartItemsContainer.innerHTML = '';
                    emptyCartMessage.style.display = 'block';
                    if (proceedToCheckoutBtn) {
                        proceedToCheckoutBtn.disabled = true;
                        proceedToCheckoutBtn.classList.add('disabled');
                    }
                    const header = document.querySelector('.cart-header');
                    if (header) header.style.display = 'none';
                    updateCartSummary([], 0);
                    return;
                }

                cartItemsContainer.innerHTML = ''; // Clear existing items

                // Add the header row back
                const headerRow = `
                    <div class="cart-header">
                        <div class="product-col">Product</div>
                        <div class="details-col">Details</div>
                        <div class="quantity-col">Quantity</div>
                        <div class="price-col">Price</div>
                        <div class="total-col">Total</div>
                        <div class="remove-col">Remove</div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('afterbegin', headerRow);

                let subtotal = 0;

                if (cartItems.length === 0) {
                    emptyCartMessage.style.display = 'block';
                    if (proceedToCheckoutBtn) {
                        proceedToCheckoutBtn.disabled = true;
                        proceedToCheckoutBtn.classList.add('disabled');
                    }
                    const header = document.querySelector('.cart-header');
                    if (header) header.style.display = 'none'; // Hide the header if cart is empty
                } else {
                    emptyCartMessage.style.display = 'none';
                    if (proceedToCheckoutBtn) {
                        proceedToCheckoutBtn.disabled = false;
                        proceedToCheckoutBtn.classList.remove('disabled');
                    }
                    const header = document.querySelector('.cart-header');
                    if (header) header.style.display = 'flex'; // Show header

                    cartItems.forEach(item => {
                        const itemTotal = item.productPrice * item.quantity;
                        subtotal += itemTotal;

                        const cartItemHTML = `
                            <div class="cart-item-row" data-product-id="${item.productId}">
                                <div class="product-col">
                                    <img src="${item.productImage}" alt="${item.productName}" onerror="this.onerror=null;this.src='https://placehold.co/50x50/cccccc/333333?text=No+Image';">
                                    ${item.productName}
                                </div>
                                <div class="details-col">${item.productSpecs || 'N/A'}</div>
                                <div class="quantity-col item-quantity">
                                    <button class="quantity-decrease" data-product-id="${item.productId}">-</button>
                                    <input type="number" value="${item.quantity}" min="1" data-product-id="${item.productId}">
                                    <button class="quantity-increase" data-product-id="${item.productId}">+</button>
                                </div>
                                <div class="price-col">₹${item.productPrice.toLocaleString('en-IN')}</div>
                                <div class="total-col">₹${itemTotal.toLocaleString('en-IN')}</div>
                                <div class="remove-col">
                                    <button class="remove-item-btn" data-product-id="${item.productId}"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        `;
                        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
                    });
                }
                updateCartSummary(cartItems, subtotal);
                attachCartEventListeners(); // Re-attach listeners after rendering
                updateCartIconQuantity(); // Update header cart quantity (calls async)
            } catch (error) {
                console.error('Error loading cart items:', error);
                showModalMessage('Failed to load cart items. Please try again.');
                cartItemsContainer.innerHTML = '';
                emptyCartMessage.style.display = 'block';
                if (proceedToCheckoutBtn) {
                    proceedToCheckoutBtn.disabled = true;
                    proceedToCheckoutBtn.classList.add('disabled');
                }
                const header = document.querySelector('.cart-header');
                if (header) header.style.display = 'none';
                updateCartSummary([], 0);
            }
        }

        /**
         * Updates the cart summary (subtotal, shipping, tax, total).
         * @param {Array} cartItems - The current array of cart items.
         * @param {number} subtotal - The calculated subtotal.
         */
        function updateCartSummary(cartItems, subtotal) {
            cartSubtotalSpan.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            const shipping = subtotal > 0 ? 500 : 0; // Example: flat shipping if items exist
            const taxRate = 0.05; // Example: 5% tax
            const tax = subtotal * taxRate;
            const grandTotal = subtotal + shipping + tax;

            cartShippingSpan.textContent = `₹${shipping.toLocaleString('en-IN')}`;
            cartTaxSpan.textContent = `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            cartTotalSpan.textContent = `Total: ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        /**
         * Attaches event listeners to dynamically added cart elements (quantity buttons, remove buttons).
         * Uses event delegation for efficiency.
         */
        function attachCartEventListeners() {
            // Remove existing listeners to prevent duplicates before re-attaching
            cartItemsContainer.removeEventListener('click', handleCartAction);
            cartItemsContainer.removeEventListener('change', handleCartAction);

            // Use event delegation for quantity buttons and remove buttons
            cartItemsContainer.addEventListener('click', handleCartAction);
            cartItemsContainer.addEventListener('change', handleCartAction);
        }

        async function handleCartAction(event) {
            const target = event.target;
            // Find the closest ancestor with data-product-id, or the target itself
            const productId = target.dataset.productId || target.closest('[data-product-id]')?.dataset.productId;

            if (!productId) return; // Not a relevant button

            const token = localStorage.getItem('token');
            if (!token) {
                showModalMessage('Please log in to modify your cart.');
                return;
            }

            if (target.classList.contains('quantity-increase') || target.classList.contains('quantity-decrease')) {
                const input = document.querySelector(`.item-quantity input[data-product-id="${productId}"]`);
                let currentQuantity = parseInt(input.value);

                if (target.classList.contains('quantity-increase')) {
                    currentQuantity++;
                } else if (target.classList.contains('quantity-decrease') && currentQuantity > 1) {
                    currentQuantity--;
                }
                input.value = currentQuantity; // Optimistically update UI
                await updateCartItemQuantity(productId, currentQuantity);
            } else if (target.type === 'number' && target.closest('.item-quantity')) {
                let newQuantity = parseInt(target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; // Default to 1 if invalid
                    target.value = 1;
                }
                await updateCartItemQuantity(productId, newQuantity);
            } else if (target.closest('.remove-item-btn')) {
                await removeItemFromCart(productId);
            }
        }

        /**
         * Sends a request to the backend to update the quantity of a product.
         * @param {string} productId - The ID of the product to update.
         * @param {number} newQuantity - The new quantity for the product.
         */
        async function updateCartItemQuantity(productId, newQuantity) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });

                const data = await response.json();

                if (response.ok) {
                    displayCartMessage(data.message || 'Cart updated successfully.', false);
                    loadCartItems(); // Re-fetch and re-render the cart to reflect changes
                } else {
                    displayCartMessage(data.message || 'Failed to update cart quantity.', true);
                    loadCartItems(); // Re-fetch to revert optimistic UI update if error
                }
            } catch (error) {
                console.error('Error updating cart quantity:', error);
                showModalMessage('Network error or server issue while updating cart.');
                loadCartItems(); // Re-fetch to revert optimistic UI update if error
            }
        }

        /**
         * Sends a request to the backend to remove an item from the cart.
         * @param {string} productId - The ID of the product to remove.
         */
        async function removeItemFromCart(productId) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    displayCartMessage(data.message || 'Item removed from cart.', false);
                    loadCartItems(); // Re-fetch and re-render the cart
                } else {
                    displayCartMessage(data.message || 'Failed to remove item from cart.', true);
                }
            } catch (error) {
                console.error('Error removing item from cart:', error);
                showModalMessage('Network error or server issue while removing item.');
            }
        }

        // Event listener for the "Proceed to Checkout" button
        if (proceedToCheckoutBtn) {
            proceedToCheckoutBtn.addEventListener('click', async function() {
                const token = localStorage.getItem('token');
                if (!token) {
                    showModalMessage('Please log in to proceed to checkout.');
                    return;
                }
                try {
                    // Fetch the latest cart data before proceeding to checkout
                    const response = await fetch(`${API_BASE_URL}/cart`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        }
                    });
                    const currentCartData = await response.json();

                    if (response.ok && currentCartData.length > 0) {
                        // Store the cart data under the 'shoppingCart' key for order_details.html
                        // This is still using localStorage for the *next page's* consumption.
                        // Ideally, order_details.html would also fetch from backend.
                        localStorage.setItem('shoppingCart', JSON.stringify(currentCartData));
                        window.location.href = 'order_details.html';
                    } else if (currentCartData.length === 0) {
                        showModalMessage('Your cart is empty. Please add items before proceeding to checkout.');
                    } else {
                        showModalMessage('Failed to fetch cart for checkout. Please try again.');
                    }
                } catch (error) {
                    console.error('Error fetching cart for checkout:', error);
                    showModalMessage('Network error or server issue during checkout preparation.');
                }
            });
        }

        loadCartItems(); // Initial load for cart page
    }

    // Logic for wishlist.html
    if (window.location.pathname.includes('wishlist.html')) {
        const wishlistItemsContainer = document.getElementById('wishlist-items-container');
        const emptyWishlistMessage = document.getElementById('empty-wishlist-message');

        async function renderWishlistItems() {
            // Fetch wishlist items from the backend API
            const token = localStorage.getItem('token');
            if (!token) {
                wishlistItemsContainer.innerHTML = '';
                emptyWishlistMessage.style.display = 'block';
                showModalMessage('Please log in to view your wishlist.');
                return;
            }

            let wishlistItems = [];
            try {
                const response = await fetch(`${API_BASE_URL}/api/wishlist`, { // Fetch wishlist from backend
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });

                if (response.ok) {
                    wishlistItems = await response.json();
                } else {
                    console.error('Failed to fetch wishlist from backend:', await response.json());
                    showModalMessage('Failed to load wishlist. Please try again.');
                }
            } catch (error) {
                console.error('Network error fetching wishlist:', error);
                showModalMessage('Network error while loading wishlist.');
            }


            wishlistItemsContainer.querySelectorAll('.wishlist-item-row').forEach(row => row.remove()); // Clear existing items

            if (wishlistItems.length === 0) {
                emptyWishlistMessage.style.display = 'block';
                wishlistItemsContainer.style.borderBottom = 'none'; // Remove border if empty
            } else {
                emptyWishlistMessage.style.display = 'none';
                wishlistItemsContainer.style.borderBottom = '1px solid #eee'; // Add border if items exist

                for (const item of wishlistItems) { // Iterate over backend-fetched wishlist items
                    // Fetch product details from backend to get price and full description for "Add to Cart"
                    let productDetails = null;
                    try {
                        // For Wishlist, we might need product details from a public endpoint too,
                        // or from the admin endpoint if the user is an admin.
                        // Assuming you have a public endpoint for individual product details or
                        // a general product list, use that. If not, the current /admin/products
                        // call with a token would work *if the user is an admin*.
                        // For a general user, this needs a PUBLIC product details endpoint.
                        const publicProductsResponse = await fetch(`${API_BASE_URL}/api/products`, { // Fetch from public product list
                             method: 'GET',
                             headers: {
                                 'Content-Type': 'application/json',
                                 // No token needed for public product list, but if you have auth, pass it
                             }
                        });
                        if (publicProductsResponse.ok) {
                            const productsResult = await publicProductsResponse.json();
                            // Find the specific product by ID from the fetched list
                            productDetails = productsResult.products.find(p => String(p._id) === String(item.productId)); // Use item.productId
                        } else {
                            console.warn(`Could not fetch details for product ID: ${item.productId}. Status: ${publicProductsResponse.status}`);
                        }
                    } catch (error) {
                        console.error(`Error fetching product details for ${item.productId}:`, error);
                    }

                    const itemRow = document.createElement('div');
                    itemRow.classList.add('wishlist-item-row');
                    itemRow.dataset.productId = item.productId; // Store product ID on the row

                    itemRow.innerHTML = `
                        <div class="product-col">
                            <img src="${item.productImage || 'https://placehold.co/80x80/E0E0E0/333333?text=No+Image'}" alt="${item.productName}" onerror="this.onerror=null;this.src='https://placehold.co/80x80/E0E0E0/333333?text=No+Image';">
                            <div class="item-details">
                                <h4>${item.productName}</h4>
                                <p>${productDetails ? `Price: ₹${productDetails.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Price: N/A'}</p>
                            </div>
                        </div>
                        <div class="details-col">
                            <p>Category: ${productDetails ? productDetails.category : 'N/A'}</p>
                            <p>ID: ${item.productId}</p>
                        </div>
                        <div class="actions-col">
                            <div class="wishlist-actions">
                                <button class="btn btn-primary add-to-cart-from-wishlist"
                                    data-product-id="${item.productId}"
                                    data-product-name="${item.productName}"
                                    data-product-price="${productDetails ? productDetails.price : 0}"
                                    data-product-image="${item.productImage}"
                                    data-product-category="${productDetails ? productDetails.category : 'N/A'}"
                                    ${productDetails && productDetails.stock > 0 ? '' : 'disabled'}
                                    >
                                    ${productDetails && productDetails.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button class="btn btn-danger remove-from-wishlist" data-id="${item.productId}">Remove</button>
                            </div>
                        </div>
                    `;
                    wishlistItemsContainer.appendChild(itemRow);
                }

                // Attach event listeners for buttons
                wishlistItemsContainer.querySelectorAll('.remove-from-wishlist').forEach(button => {
                    button.addEventListener('click', handleRemoveFromWishlist);
                });
                wishlistItemsContainer.querySelectorAll('.add-to-cart-from-wishlist').forEach(button => {
                    button.addEventListener('click', handleAddToCartFromWishlist);
                });
            }
        }

        // Handle removing an item from wishlist
        async function handleRemoveFromWishlist(event) {
            const productId = event.currentTarget.dataset.id;
            const token = localStorage.getItem('token');

            if (!token) {
                showModalMessage('Please log in to modify your wishlist.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${productId}`, { // Assuming /api/wishlist/remove/:productId
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    displayGlobalMessage('Item removed from wishlist.', 'success');
                    updateWishlistIconQuantity(); // Update wishlist icon in header
                    renderWishlistItems(); // Re-render to update UI
                } else {
                    displayGlobalMessage(data.message || 'Failed to remove item from wishlist.', 'error');
                }
            } catch (error) {
                console.error('Error removing item from wishlist:', error);
                displayGlobalMessage('Network error or server issue while removing item from wishlist.', 'error');
            }
        }

        // Handle adding an item from wishlist to cart
        async function handleAddToCartFromWishlist(event) {
            const productId = event.currentTarget.dataset.productId;
            const productName = event.currentTarget.dataset.productName;
            const productPrice = parseFloat(event.currentTarget.dataset.productPrice);
            const productImage = event.currentTarget.dataset.productImage;
            const productCategory = event.currentTarget.dataset.productCategory;

            const token = localStorage.getItem('token');
            if (!token) {
                showModalMessage('Please log in to add products to your cart.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        productId,
                        productName,
                        productPrice,
                        productImage,
                        category: productCategory, // Include category for consistency
                        quantity: 1
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    displayGlobalMessage(`${productName} moved to cart!`, 'success');
                    // After successfully adding to cart, remove from wishlist via backend
                    await handleRemoveFromWishlist({ currentTarget: { dataset: { id: productId } } }); // Call the backend removal
                    updateCartIconQuantity(); // Update cart icon in header
                } else {
                    displayGlobalMessage(data.message || `Failed to move ${productName} to cart.`, 'error');
                }
            } catch (error) {
                console.error('Error moving item to cart from wishlist:', error);
                displayGlobalMessage('Network error or server issue while moving item to cart.', 'error');
            }
        }

        renderWishlistItems(); // Initial load for wishlist page
    }

    // Logic for products.html
    if (window.location.pathname.includes('products.html')) {
        const messageBox = document.getElementById('messageBox'); // Assuming you have a messageBox in products.html
        const productsContainer = document.querySelector('.products-container'); // Parent container for all product grids

        // Define the categories and their corresponding grid IDs
        const productCategories = {
            "Gaming Laptops": "gaming-laptops-grid",
            "Business Laptops": "business-laptops-grid",
            "Ultrabooks": "ultrabooks-grid",
            "2-in-1 Laptops": "2-in-1-laptops-grid",
            "Student Laptops": "student-laptops-grid"
        };
        const defaultCategoryGridId = "other-laptops-grid"; // For products not matching defined categories

        // Function to render a single product card
        function renderProductCard(product) {
            return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageUrl || 'https://placehold.co/300x200/E0E0E0/333333?text=No+Image'}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/E0E0E0/333333?text=No+Image';">
                        <div class="product-action-buttons">
                            <button class="action-btn wishlist-btn"
                                data-product-id="${product._id}"
                                data-product-name="${product.name}"
                                data-product-image="${product.imageUrl}"
                                data-product-price="${product.price}"
                                data-product-category="${product.category}">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="action-btn"><i class="fas fa-search"></i></button>
                            <button class="action-btn add-to-cart-btn"
                                data-product-id="${product._id}"
                                data-product-name="${product.name}"
                                data-product-price="${product.price}"
                                data-product-image="${product.imageUrl}"
                                data-product-specs="${product.description}">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        <button class="add-to-cart-btn"
                            data-product-id="${product._id}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            data-product-image="${product.imageUrl}"
                            data-product-specs="${product.description}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }

        // Function to display messages to the user (local to products.html logic)
        function showMessage(message, type = 'success') {
            if (messageBox) {
                messageBox.textContent = message;
                messageBox.className = `message-box show ${type}`; // Reset classes and add new ones
                setTimeout(() => {
                    messageBox.classList.remove('show');
                }, 5000); // Hide after 5 seconds
            }
        }

        // Function to load products dynamically from backend and categorize them
        async function loadProducts() {
            // Clear all grids and show loading messages
            Object.values(productCategories).forEach(gridId => {
                const gridElement = document.getElementById(gridId);
                if (gridElement) gridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">Loading ${gridId.replace('-grid', '').replace('-', ' ')}...</p>`;
            });
            const defaultGridElement = document.getElementById(defaultCategoryGridId);
            if (defaultGridElement) defaultGridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">Loading other laptops...</p>`;

            try {
                // !!! IMPORTANT CHANGE HERE !!!
                // Changed from '/admin/products' to '/api/products'
                // This assumes you have a public endpoint for products that doesn't require admin auth.
                const PUBLIC_PRODUCTS_API_URL = `${API_BASE_URL}/products`;
                console.log('Fetching products from:', PUBLIC_PRODUCTS_API_URL);

                // No token is strictly needed for a public endpoint, but including it is harmless
                // if your backend handles it gracefully for non-admin requests.
                const token = localStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (token) {
                    headers['x-auth-token'] = token;
                }

                const response = await fetch(PUBLIC_PRODUCTS_API_URL, {
                    method: 'GET',
                    headers: headers
                });

                console.log('Products API response status:', response.status);
                const responseText = await response.text();
                console.log('Products API raw response text:', responseText);

                if (!response.ok) {
                    try {
                        const errorResult = JSON.parse(responseText);
                        throw new Error(errorResult.message || `Failed to fetch products. Status: ${response.status}`);
                    } catch (parseError) {
                        // If it's not JSON, it's likely HTML from a 404/500 page
                        throw new Error(`Failed to fetch products: Non-JSON response from server. Status: ${response.status}. Raw response: ${responseText.substring(0, 200)}...`);
                    }
                }

                const result = JSON.parse(responseText);
                const products = result.products; // Assuming your backend returns { products: [...] }

                // Clear all grids before rendering
                Object.values(productCategories).forEach(gridId => {
                    const gridElement = document.getElementById(gridId);
                    if (gridElement) gridElement.innerHTML = '';
                });
                if (defaultGridElement) defaultGridElement.innerHTML = '';

                const categorizedProducts = {};
                for (const category in productCategories) {
                    categorizedProducts[category] = [];
                }
                categorizedProducts['Other'] = []; // For uncategorized products

                products.forEach(product => {
                    if (product.category && productCategories[product.category]) { // Check if product.category exists and is a defined category
                        categorizedProducts[product.category].push(product);
                    } else {
                        categorizedProducts['Other'].push(product);
                    }
                });

                let hasProducts = false;

                for (const category in categorizedProducts) {
                    const gridId = productCategories[category] || defaultCategoryGridId;
                    const gridElement = document.getElementById(gridId);

                    if (gridElement) { // Ensure the grid element exists
                        if (categorizedProducts[category].length > 0) {
                            hasProducts = true;
                            categorizedProducts[category].forEach(product => {
                                gridElement.insertAdjacentHTML('beforeend', renderProductCard(product));
                            });
                        } else {
                            // Only display "No products available" if it's the specific section for that category
                            // and there are no products in that category.
                            // The default grid might have products, so don't replace its message
                            // unless it's explicitly categorized as "Other" and empty.
                            if (category !== 'Other' || (category === 'Other' && categorizedProducts['Other'].length === 0)) {
                                gridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No ${category.toLowerCase()} available.</p>`;
                            }
                        }
                    }
                }
                // Handle the case where there are no products overall
                if (!hasProducts && products.length === 0) {
                    if (messageBox) {
                        messageBox.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No products available at the moment. Please check back later!</p>`;
                        messageBox.classList.add('show', 'info');
                    }
                } else {
                    if (messageBox) messageBox.classList.remove('show');
                }


                // Add event listeners for add to cart and wishlist buttons after products are loaded
                document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                    button.addEventListener('click', async function(event) {
                        event.preventDefault(); // Prevent default button behavior

                        console.log('Add to Cart button clicked!'); // Debug log

                        const productId = this.dataset.productId;
                        const productName = this.dataset.productName;
                        const productPrice = parseFloat(this.dataset.productPrice);
                        const productImage = this.dataset.productImage;
                        const productSpecs = this.dataset.productSpecs;
                        const quantity = 1; // Default quantity when adding from product card

                        console.log('Product data from button:', { productId, productName, productPrice, productImage, productSpecs, quantity }); // Debug log

                        const token = localStorage.getItem('token');
                        console.log('Token present for cart add:', !!token); // Debug log

                        if (!token) {
                            showModalMessage('Please log in to add products to your cart.');
                            return;
                        }

                        try {
                            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-auth-token': token
                                },
                                body: JSON.stringify({
                                    productId,
                                    productName,
                                    productPrice,
                                    productImage,
                                    productSpecs,
                                    quantity
                                })
                            });

                            const data = await response.json();
                            console.log('Cart add API response:', data); // Debug log

                            if (response.ok) {
                                displayGlobalMessage(`${productName} added to cart!`, 'success'); // Use local showMessage
                                updateCartIconQuantity(); // Update the cart icon in header (fetches from backend)
                            } else {
                                displayGlobalMessage(data.message || 'Failed to add product to cart.', 'error'); // Use local showMessage
                                console.error('Error adding to cart:', data.error || data.message);
                            }
                        } catch (error) {
                            console.error('Network error adding to cart:', error);
                            displayGlobalMessage('An error occurred. Please try again later.', 'error'); // Use local showMessage
                        }
                    });
                });
                document.querySelectorAll('.wishlist-btn').forEach(button => {
                    button.addEventListener('click', async function(event) {
                        event.preventDefault();
                        console.log('Add to Wishlist button clicked!'); // Debug log

                        const productId = this.dataset.productId;
                        const productName = this.dataset.productName;
                        const productImage = this.dataset.productImage;
                        const productPrice = parseFloat(this.dataset.productPrice); // Get price from data attribute
                        const productCategory = this.dataset.productCategory; // Get category from data attribute

                        console.log('Wishlist product data from button:', { productId, productName, productImage, productPrice, productCategory }); // Debug log

                        const token = localStorage.getItem('token');
                        console.log('Token present for wishlist add:', !!token); // Debug log

                        if (!token) {
                            showModalMessage('Please log in to add products to your wishlist.');
                            return;
                        }

                        try {
                            const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, { // Assuming a new backend endpoint
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-auth-token': token
                                },
                                body: JSON.stringify({
                                    productId,
                                    productName,
                                    productImage,
                                    productPrice, // Include price
                                    productCategory // Include category
                                })
                            });

                            const data = await response.json();
                            console.log('Wishlist add API response:', data); // Debug log

                            if (response.ok) {
                                displayGlobalMessage(`${productName} added to wishlist!`, 'success'); // Use local showMessage
                                updateWishlistIconQuantity(); // Update wishlist icon in header (fetches from backend)
                            } else {
                                displayGlobalMessage(data.message || `Failed to add ${productName} to wishlist.`, 'error'); // Use local showMessage
                            }
                        } catch (error) {
                            console.error('Network error adding to wishlist:', error);
                            displayGlobalMessage('An error occurred. Please try again later.', 'error'); // Use local showMessage
                        }
                    });
                });

            } catch (error) {
                console.error('Error loading products:', error);
                // Clear all grids and show an error message
                Object.values(productCategories).forEach(gridId => {
                    const gridElement = document.getElementById(gridId);
                    if (gridElement) gridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--error-color);">Failed to load products for this section.</p>`;
                });
                if (defaultGridElement) defaultGridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--error-color);">Failed to load other products.</p>`;
                displayGlobalMessage(`Failed to load products: ${error.message}`, 'error');
            }
        }

        loadProducts(); // Initial load for products page
    }
});