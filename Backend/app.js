const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const shortid = require('shortid');
const connectDB = require('./db'); // Assuming db.js handles MongoDB connection
// const shortid = require('shortid'); // For generating orderId

// Import Mongoose Models
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Wishlist = require('./models/Wishlist');
const Address = require('./models/Address'); // NEW: Import Address model

// Import Middleware
const auth = require('./middleware/auth'); // Existing user auth middleware

// Import Route Files
const wishlistRoutes = require('./routes/wishlist'); // Assuming routes/wishlist.js exists

const Razorpay = require('razorpay'); // Import Razorpay

const app = express();
const PORT = 3000;
const JWT_SECRET = 'yourSecretKeyHere'; // IMPORTANT: Use a strong, environment-variable based secret in production

// Initialize Razorpay (WITH YOUR ACTUAL KEYS - replace with secure method in production)
const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware
// Explicitly configure CORS
app.use(cors({
    origin: [
    'http://localhost:5500',
    'https://laptop-store-drab.vercel.app',
    'https://frontend-six-azure-35.vercel.app',
    'https://new-laptop-store.onrender.com',
    'https://laptop-store-p5br.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// --- User Authentication Routes ---
// Signup Route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword }); // isAdmin defaults to false
        await newUser.save();

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } }); // Include isAdmin in response
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Admin Authentication Route ---
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Crucial: Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Not an administrator.' });
        }

        const token = jwt.sign({ user: { id: user._id, isAdmin: true } }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
        console.error('Error during admin login:', err);
        res.status(500).send('Server error');
    }
});

// --- User Profile Routes ---

// @route   GET /profile
// @desc    Get authenticated user's profile
// @access  Private
app.get('/profile', auth, async (req, res) => {
    try {
        // req.user.id is populated by the 'auth' middleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Server error');
    }
});

// --- NEW/UPDATED: Address Management Routes using Address Model ---

// @route   GET /addresses
// @desc    Get all shipping addresses for the authenticated user
// @access  Private
app.get('/addresses', auth, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });
        res.json(addresses);
    } catch (err) {
        console.error('Error fetching shipping addresses:', err);
        res.status(500).send('Server error');
    }
});

// @route   POST /addresses
// @desc    Add a new shipping address for the authenticated user
// @access  Private
app.post('/addresses', auth, async (req, res) => {
    const { fullName, addressLine1, addressLine2, city, state, zipCode, phoneNumber, isDefault } = req.body;
    try {
        const newAddress = new Address({
            userId: req.user.id,
            fullName,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            phoneNumber,
            isDefault: isDefault || false
        });
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (err) {
        console.error('Error adding address:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /addresses/:id
// @desc    Update an existing shipping address for the authenticated user
// @access  Private
app.put('/addresses/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { fullName, addressLine1, addressLine2, city, state, zipCode, phoneNumber, isDefault } = req.body;
    try {
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, userId: req.user.id }, // Ensure user owns the address
            { fullName, addressLine1, addressLine2, city, state, zipCode, phoneNumber, isDefault },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found or not authorized' });
        }
        res.json(updatedAddress);
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /addresses/:id
// @desc    Delete a shipping address for the authenticated user
// @access  Private
app.delete('/addresses/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAddress = await Address.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found or not authorized' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).json({ error: err.message });
    }
});


// --- Product Routes (Public and Admin) ---

// GET all products (publicly accessible for product listing page)
// @route   GET /products
// @desc    Get all products
// @access  Public
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (err) {
        console.error('Error fetching public products:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// GET all products (Admin Only - typically for management)
// @route   GET /admin/products
// @desc    Get all products (Admin only)
// @access  Private (Admin)
app.get('/admin/products', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const products = await Product.find({});
        res.json({ products });
    } catch (err) {
        console.error('Error fetching admin products:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// POST a new product (Admin Only)
app.post('/admin/products', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to add products.' });
    }

    const { name, category, price, stock, description, imageUrl } = req.body;

    if (!name || !category || !price || !stock || !description || !imageUrl) {
        return res.status(400).json({ message: 'All product fields are required.' });
    }

    try {
        const newProduct = new Product({
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            description,
            imageUrl
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// DELETE a product by ID (Admin Only)
app.delete('/admin/products/:id', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to delete products.' });
    }

    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// PUT/PATCH (Update) a product by ID (Admin Only)
app.put('/admin/products/:id', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to update products.' });
    }

    const { id } = req.params;
    const updatedProductData = req.body;

    try {
        const product = await Product.findByIdAndUpdate(id, updatedProductData, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json({ message: 'Product updated successfully', product });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});


// --- Cart Routes ---
// Get Cart Items Route
app.get('/cart', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.json([]); // Return empty array if cart not found for user
        }
        res.json(cart.items);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Add Item to Cart Route
app.post('/cart/add', auth, async (req, res) => {
    const { productId, productName, productPrice, productImage, productSpecs, quantity } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If no cart exists for the user, create a new one
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            // If item already exists, update its quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Otherwise, add new item to cart
            cart.items.push({ productId, productName, productPrice, productImage, productSpecs, quantity });
        }

        cart.updatedAt = Date.now(); // Update timestamp
        await cart.save();
        res.json({ message: 'Product added to cart successfully', cart: cart.items });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Update Cart Item Quantity Route
app.put('/cart/update/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.updatedAt = Date.now();
            await cart.save();
            res.json({ message: 'Cart item quantity updated successfully', cart: cart.items });
        } else {
            res.status(404).json({ message: 'Product not found in cart to update.' });
        }
    } catch (err) {
        console.error('Error updating cart item quantity:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Remove Item from Cart Route
app.delete('/cart/remove/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => item.productId !== productId);

        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ message: 'Product not found in cart to remove.' });
        }

        cart.updatedAt = Date.now();
        await cart.save();
        res.json({ message: 'Product removed from cart successfully', cart: cart.items });
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// --- Wishlist Routes (Integrated from routes/wishlist.js) ---
app.use('/api/wishlist', wishlistRoutes); // This assumes `wishlistRoutes` handles auth internally if needed

// --- Order & Payment Routes ---
// Create Razorpay Order Route
app.post('/create-razorpay-order', auth, async (req, res) => {
    const { amount, currency, receipt } = req.body; // amount in smallest unit (e.g., paise for INR)

    try {
        const options = {
            amount: amount, // amount in smallest currency unit
            currency: currency,
            receipt: receipt,
            payment_capture: 1 // auto capture payment
        };
        const order = await razorpayInstance.orders.create(options);
        res.json({ orderId: order.id, currency: order.currency, amount: order.amount });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create Razorpay order: ' + error.message });
    }
});


// Place Order Route (Modified to accept Razorpay details)
app.post('/orders', auth, async (req, res) => {
    const {
        customerInfo,
        shippingAddress,
        paymentMethod,
        items,
        subtotal,
        shipping,
        grandTotal,
        razorpayPaymentId,
        razorpayOrderId
    } = req.body;
    const userId = req.user.id;

    try {
        if (!customerInfo || !shippingAddress || !paymentMethod || !items || items.length === 0 || !grandTotal) {
            return res.status(400).json({ message: 'Missing required order details.' });
        }

        // Generate a unique orderId if not provided by frontend
        const newOrderId = `ORD-${Date.now()}-${shortid.generate().toUpperCase()}`; // Using shortid

        const newOrder = new Order({
            userId: req.user.id,
            orderId: newOrderId,
            customerInfo,
            shippingAddress,
            paymentMethod,
            items,
            subtotal,
            shipping,
            grandTotal,
            razorpayPaymentId,
            razorpayOrderId,
            status: 'pending' // Default status
        });

        await newOrder.save();

        // After successful order, clear the user's cart in the database
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = []; // Empty the cart
            cart.updatedAt = Date.now();
            await cart.save();
        }

        res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.orderId, order: newOrder });

    } catch (err) {
        console.error('Error placing order:', err);
        if (err.code === 11000 && err.keyPattern && err.keyPattern.orderId) {
            return res.status(409).json({ message: 'Order with this ID already exists. Please try again.' });
        }
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// GET All Orders for the Authenticated User
// @route   GET /orders/user
// @desc    Get all orders for the authenticated user
// @access  Private
app.get('/orders/user', auth, async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await Order.find({ userId: userId })
                                  .sort({ orderDate: -1 });
        // Return the array of orders directly
        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});


// GET Order Details by Order ID Route (for regular users to track their own orders)
app.get('/orders/:orderId', auth, async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        const order = await Order.findOne({ orderId: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
        }
        res.json({ order });
    }
    catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// --- Admin-Specific Routes ---

// GET All Orders (Admin Only - MODIFIED FOR FILTERS AND SEARCH)
app.get('/admin/orders', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to view this resource.' });
        }

        const { search, status, paymentMethod, dateFrom, dateTo, amountMin, amountMax } = req.query;
        const query = {};

        // Search by orderId, customer name, or email
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { orderId: searchRegex },
                { 'customerInfo.fullName': searchRegex },
                { 'customerInfo.email': searchRegex }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by payment method
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            query.orderDate = {};
            if (dateFrom) {
                query.orderDate.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endOfDay = new Date(dateTo);
                endOfDay.setHours(23, 59, 59, 999);
                query.orderDate.$lte = endOfDay;
            }
        }

        // Filter by amount range
        if (amountMin || amountMax) {
            query.grandTotal = {};
            if (amountMin) {
                query.grandTotal.$gte = parseFloat(amountMin);
            }
            if (amountMax) {
                query.grandTotal.$lte = parseFloat(amountMax);
            }
        }

        const orders = await Order.find(query).sort({ orderDate: -1 });
        res.json({ orders });
    } catch (err) {
        console.error('Error fetching all orders (admin):', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// UPDATE Order Status (Admin Only)
app.put('/admin/orders/:orderId/status', auth, async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to perform this action.' });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status provided.' });
        }

        const order = await Order.findOneAndUpdate(
            { orderId: orderId },
            { $set: { status: status } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.json({ message: 'Order status updated successfully!', order });
    } catch (err) {
        console.error('Error updating order status (admin):', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// GET All Users (Admin Only - excluding other admins)
app.get('/admin/users', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to view this resource.' });
        }

        const users = await User.find({ isAdmin: false }).select('-password');
        res.json({ users });
    } catch (err) {
        console.error('Error fetching all users (admin):', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// DELETE User (Admin Only)
app.delete('/admin/users/:userId', auth, async (req, res) => {
    const { userId } = req.params;

    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to perform this action.' });
        }

        if (userId === adminUser._id.toString()) {
            return res.status(400).json({ message: 'Admins cannot delete their own account from this panel.' });
        }

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (userToDelete.isAdmin) {
            return res.status(403).json({ message: 'Cannot delete another administrator account from this panel.' });
        }

        await User.findByIdAndDelete(userId);

        // Delete related data for the user
        await Order.deleteMany({ userId: userId });
        await Cart.deleteOne({ userId: userId });
        await Wishlist.deleteOne({ userId: userId });
        await Address.deleteMany({ userId: userId }); // NEW: Delete associated addresses

        res.json({ message: 'User and associated data deleted successfully!' });

    } catch (err) {
        console.error('Error deleting user (admin):', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});


// Simple root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
