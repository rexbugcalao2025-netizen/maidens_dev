// src/controllers/cart.js

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js'; // assumed existing

/**
 * GET ACTIVE CART (or create if none)
 */
export async function getMyCart(req, res) {
  try {
    let cart = await Cart.findOne({
      user_id: req.user.id,
      status: 'active'
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: req.user.id,
        items: [],
        total_amount: 0
      });
    }

    res.json(cart);
  } catch (err) {
    console.error('GetCart error:', err);
    res.status(500).json({ message: 'Failed to get cart' });
  }
}

/**
 * ADD ITEM TO CART
 */
export async function addItem (req, res) {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({
      user_id: req.user.id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({ user_id: req.user.id });
    }

    const existingItem = cart.items.find(
      i => i.product_id.toString() === product_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product_id,
        quantity,
        price: product.price // price snapshot
      });
    }

    await cart.save();

    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (err) {
    console.error('AddItem error:', err);
    res.status(500).json({ message: 'Failed to add item' });
  }
}

/**
 * UPDATE CART ITEM QUANTITY
 */
export async function updateItem (req, res) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({
      user_id: req.user.id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      message: 'Cart item updated',
      cart
    });
  } catch (err) {
    console.error('UpdateItem error:', err);
    res.status(500).json({ message: 'Failed to update item' });
  }
}

/**
 * REMOVE ITEM FROM CART
 */
export async function removeItem (req, res) {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user_id: req.user.id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );

    await cart.save();

    res.json({
      message: 'Item removed from cart',
      cart
    });
  } catch (err) {
    console.error('RemoveItem error:', err);
    res.status(500).json({ message: 'Failed to remove item' });
  }
}

/**
 * CHECKOUT (CONVERT CART → ORDER)
 */
export async function checkout (req, res) {
  try {
    const cart = await Cart.findOne({
      user_id: req.user.id,
      status: 'active'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order from cart snapshot
    const order = await Order.create({
      user_id: cart.user_id,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      total_amount: cart.total_amount,
      status: 'placed'
    });

    // Close cart
    cart.status = 'checked_out';
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed' });
  }
}
