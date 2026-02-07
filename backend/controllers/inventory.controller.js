// No SQL. No Business Rules. Just orchistration + error forwarding.
// src/controllers/inventory.controller.js
// /api/inventory/*

import * as inventoryService from '../src/services/inventory.service.js';


/*
    READ
*/ 

export async function listProducts(req, res, next){
    try {
        const products = await inventoryService.listProducts();
        res.json(products);
    } catch (err) {
        next(err);
    };
}

export async function getProduct (req, res, next){
    try {
        const { id } = req.params;
        const product = await inventoryService.getProductById(id);

        if (!product) {
            return res.status(404)
                .json({ message: 'Product not found'});                
        }

        res.json(product);        
    } catch (err){
        next(err);
    }
}


export async function listMovements(req, res, next){
    try {
        const { productId, limit } = req.query;

        const movements = await inventoryService.listMovements({
            productId,
            limit: limit ? Number(limit) : undefined
        });

        res.json(movements);
    } catch (err){
        next(err);
    }
}

export async function lowStock(req, res, next){
    try {
        const items = await inventoryService.lowStock();
        res.json(items);
    } catch (err){
        next(err);
    }
}

/*
    WRITE
*/ 

export async function adjustStock(req, res, next){
    try {
        await inventoryService.adjustStock(req.body, req.user);

        res.json({
            success: true,
            message: 'Stock adjusted successfully'
        });
    } catch (err){
        next(err);
    }
}

export async function consumeStock(req, res, next){
    try { 
        
        const { productId, quantity, reference, referenceId } = req.body;

        await inventoryService.consumeStock({
            productId, quantity, reference, referenceId }, 
            req.user
        );

        res.json({
            success: true,
            message: 'Stock consumed successfully'
        });

    } catch (err) {
        next(err);
    }
}