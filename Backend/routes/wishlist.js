const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const Wishlist = require('../models/Wishlist'); // Your Wishlist Mongoose model
const Product = require('../models/Product'); // Assuming you have a Product Mongoose model

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private (requires authentication)
router.get('/', auth, async (req, res) => {
    try {
        // Find the wishlist for the authenticated user
        // req.user.id comes from your auth middleware (assuming decoded.user.id or decoded.id)
        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            // If no wishlist found for the user, return an empty array
            return res.json([]);
        }
        // Return the items array from the wishlist document
        res.json(wishlist.items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/wishlist/add
// @desc    Add item to user's wishlist
// @access  Private (requires authentication)
router.post('/add', auth, async (req, res) => {
    // Destructure product details from the request body
    const { productId, productName, productImage, productPrice, productCategory } = req.body;

    // Basic validation (you might want more robust validation here)
    if (!productId || !productName || !productPrice) {
        return res.status(400).json({ message: 'Product ID, name, and price are required.' });
    }

    try {
        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            // If no wishlist exists for the user, create a new one
            wishlist = new Wishlist({ userId: req.user.id, items: [] });
        }

        // Check if the product already exists in the wishlist
        const existingItem = wishlist.items.find(item => String(item.productId) === productId);

        if (existingItem) {
            return res.status(400).json({ message: 'Product is already in your wishlist.' });
        }

        // Add the new item to the wishlist's items array
        wishlist.items.push({
            productId,
            productName,
            productImage,
            productPrice,
            productCategory,
            addedAt: new Date() // Record the time it was added
        });

        // Save the updated wishlist
        await wishlist.save();

        res.status(200).json({ message: 'Product added to wishlist successfully.', item: wishlist.items[wishlist.items.length - 1] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/wishlist/remove/:productId
// @desc    Remove item from user's wishlist
// @access  Private (requires authentication)
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found for this user.' });
        }

        // Filter out the item to be removed
        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => String(item.productId) !== req.params.productId
        );

        // If no item was removed, it means the product was not found in the wishlist
        if (wishlist.items.length === initialLength) {
            return res.status(404).json({ message: 'Product not found in wishlist.' });
        }

        // Save the updated wishlist
        await wishlist.save();

        res.json({ message: 'Product removed from wishlist successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
