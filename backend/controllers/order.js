const Order = require('../models/Order');

/**
 * GET MY ORDERS (USER)
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('GetMyOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/**
 * GET SINGLE ORDER (USER)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('GetOrder error:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/**
 * ADMIN: GET ALL ORDERS
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'first_name last_name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('GetAllOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/**
 * ADMIN: UPDATE ORDER STATUS
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'placed',
      'paid',
      'processing',
      'shipped',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (err) {
    console.error('UpdateOrderStatus error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

/**
 * ADD PAYMENT TO ORDER
 */
exports.addPayment = async (req, res) => {
  try {
    const { type_of_payment, amount, reference_number } = req.body;

    if (!type_of_payment || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment data' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add payment record
    order.payment.push({
      type_of_payment,
      amount,
      reference_number
    });

    // Calculate total paid
    const totalPaid = order.payment.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Update payment status
    if (totalPaid >= order.total_amount) {
      order.payment_status = 'paid';
      order.status = 'paid';
    } else if (totalPaid > 0) {
      order.payment_status = 'partial';
    }

    await order.save();

    res.json({
      message: 'Payment added',
      order
    });
  } catch (err) {
    console.error('AddPayment error:', err);
    res.status(500).json({ message: 'Failed to add payment' });
  }
};

/**
 * SOFT DELETE ORDER (ADMIN)
 */
exports.deleteOrder = async (req, res) => {
  try {
    const result = await Order.updateOne(
      { _id: req.params.id },
      { $set: { is_deleted: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted (soft delete)' });
  } catch (err) {
    console.error('DeleteOrder error:', err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};
