// src/controllers/order.js


import Order from '../models/Order';


/**
 * GET MY ORDERS (USER)
 */
export async function getMyOrders (req, res) {
  try {
    const orders = await Order.find({ 
      user_id: req.user.id,
      is_deleted: false
     })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('GetMyOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

/**
 * GET SINGLE ORDER (USER)
 */
export async function getOrderById (req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user.id,
      is_deleted: false
    }).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('GetOrder error:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
}

/**
 * ADMIN: GET ALL ORDERS
 */
export async function getAllOrders (req, res) {
  try {
    const orders = await Order.find({ is_deleted: false })
      .populate({
        path: 'user_id', 
        select: 'first_name last_name email'})
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('GetAllOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

/**
 * ADMIN: UPDATE ORDER STATUS
 */
export async function updateOrderStatus (req, res) {
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

    const allowedTransitions = {
      placed: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled'],
      processing:['shipped'],
      shipped: ['completed'],
      completed:[],
      cancelled: []
    };

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // const order = await Order.findByIdAndUpdate(
    //   { _id: req.params.id, is_deleted: false },
    //   { status },
    //   { new: true, runValidators: true }
    // );

    const order = await Order.findOne({
      _id: req.params.id,
      is_deleted: false
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order status provided is already applied
    if (order.status === status){
      return res.status(400).json({
        message: 'Order is already in this status'
      });
    }

    // Check if order status follow set order status transitions
    if (!allowedTransitions[order.status]?.includes(status)){
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated',
      order
    });

  } catch (err) {
    console.error('UpdateOrderStatus error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
}

/**
 * ADD PAYMENT TO ORDER (ADMIN)
 */
export async function addPayment (req, res) {
  try {
    const { type_of_payment, amount, reference_number } = req.body;

    if (!type_of_payment || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment data' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      is_deleted: false
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }  

    if(['cancelled', 'completed'].includes(order.status)){
      return res.status(400).json({
        message: 'Payments are not allowed for this order'
      });
    }
   
    // Calculate total paid
    const totalPaid = order.payment.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Check for Overpayment
    if (totalPaid + amount > order.total_amount){
      return res.status(400).json({
        message: 'Payment exceeds remaining balance'
      });
    }

    // Add payment record
    order.payment.push({
      type_of_payment,
      amount,
      reference_number
    });

    // Update payment status
    const newTotalPaid = totalPaid + amount;

    if (newTotalPaid >= order.total_amount) {
      order.payment_status = 'paid';

      if(['placed', 'processing'].includes(order.status)){
        order.status = 'paid';
      }
      
    } else if (newTotalPaid > 0) {
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
}

/**
 * SOFT DELETE ORDER (ADMIN)
 */
export async function deleteOrder (req, res) {
  try {
    const result = await Order.updateOne(
      { _id: req.params.id,
        is_deleted: false
       },
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
}


/**
 * ADD PAYMENT TO ORDER (USER)
 */
export async function addPaymentByUser (req, res) {
  try {
    const { type_of_payment, amount, reference_number } = req.body;

    if (!type_of_payment || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment data' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user.id,
      is_deleted: false
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if(['cancelled', 'completed'].includes(order.status)){
      return res.status(400).json({
        message: 'Payments are not allowed for this order'
      });
    }

    // Check for duplicate reference number
    if (reference_number){
      const exists = order.payment.some(
        p => p.reference_number === reference_number
      );

      if (exists){
        return res.status(400).json({
          message: 'Duplicate payment reference'
        });
      }
    }   

    // Calculate total paid
    const totalPaid = order.payment.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Check for Overpayment
    if (totalPaid + amount > order.total_amount){
      return res.status(400).json({
        message: 'Payment exceeds remaining balance'
      });
    }

    // Add payment record
    order.payment.push({
      type_of_payment,
      amount,
      reference_number
    });

    // Update payment status
    const newTotalPaid = totalPaid + amount;

    if (newTotalPaid >= order.total_amount) {
      order.payment_status = 'paid';
      // order.status = 'paid'; -- for admin verification
    } else if (newTotalPaid > 0) {
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
}