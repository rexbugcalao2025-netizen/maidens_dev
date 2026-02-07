// src/middlewares/inventory.validation.js

export function validateConsumeStock(req, res, next){
    const { productId, quantity } = req.body;

    if (!productId || quantity == null){
        res.status(400).json({
            error: 'product and quantity are required'
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0){
        return res.status(400).json({
            error: 'quantity must be a positive integer'
        });
    }

    next();
}

export function validateAdjustStock(req, res, next){
    const { productId, type, quantity } = req.body;

    if (!productId || !type || quantity == null) {
        return res.status(400).json({
            error: 'productId, type and quantity are required'
        });
    }

    if (!['IN', 'OUT'].includes(type)) {
        return res.status(400).json({
            error: 'type must be IN or OUT'
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            error: 'quantity must be a positive integer'
        });
    }

    next();
}
