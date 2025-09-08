// models/Cart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: String, // Corresponds to data-product-id
    required: true
  },
  productName: {
    type: String, // Corresponds to data-product-name
    required: true
  },
  productPrice: {
    type: Number, // Corresponds to data-product-price
    required: true
  },
  productImage: {
    type: String, // Corresponds to data-product-image
    required: true
  },
  productSpecs: {
    type: String, // Corresponds to data-product-specs
    required: false // Or true, depending on if all products always have specs
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true // A user should only have one cart
  },
  items: [CartItemSchema], // Array of cart items
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);