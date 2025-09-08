// models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String, required: false },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false }); // Do not create a default _id for subdocuments

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: { // A unique ID for the order, can be generated on frontend or backend
        type: String,
        required: true,
        unique: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    customerInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
   shippingAddress: {
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String }, // optional
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phoneNumber: { type: String, required: true }
},

    paymentMethod: {
        type: String,
        enum: ['credit-card', 'upi', 'net-banking', 'cash-on-delivery', 'razorpay'], // Added 'razorpay'
        required: true
    },
    items: [OrderItemSchema], // Array of ordered products
    subtotal: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    razorpayPaymentId: { // New field for Razorpay payment ID
        type: String,
        required: function() { return this.paymentMethod === 'razorpay'; } // Required only if payment method is razorpay
    },
    razorpayOrderId: { // New field for Razorpay order ID
        type: String,
        required: function() { return this.paymentMethod === 'razorpay'; } // Required only if payment method is razorpay
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Order', OrderSchema);
