const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    productPrice: { type: Number, required: true },
    productCategory: { type: String },
    addedAt: { type: Date, default: Date.now }
});

const WishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Each user has one wishlist document
    items: [WishlistItemSchema]
});

module.exports = mongoose.model('Wishlist', WishlistSchema);