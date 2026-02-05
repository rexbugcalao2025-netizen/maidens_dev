// src/services/inventory.service.js

import * as inventoryRepo from '../repositories/inventory.repo.js';

/*
    READ
*/ 

export async function listProducts(){
    return inventoryRepo.listProducts();
}

export async function getProductById(productId){
    if (!productId) return null;
    return inventoryRepo.getProductById(productId);
}

export async function listMovements({ productId, limit }){
    return inventoryRepo.listMovements({
        productId,
        limit
    });
}

export async function lowStock(){
    return inventoryRepo.lowStock();
}



/*
    WRITE
*/ 

export async function adjustStock(data, user) {
    const { productId, type, quantity, reference } = data;

    // --- validation ---
    if (!productId){
        throw new Error('Product ID is required');
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
        throw new Error('Invalid stock movement type');
    }

    if (!Number.isInteger(quantity) || quantity <= 0){
        throw new Error('Quantity must be a positive integer');
    }

    // --- permission check ---
    if (!user?.isAdmin){
        throw new Error ('Unauthorized stock adjustment');
    }
    
    // --- delegate to DB ---
    await inventoryRepo.adjustStock({
        productId,
        type,
        quantity,
        reference,
        userId: user.id
    });
}

export async function consumeStock(data, user){
    const { productId, quantity, referenceType, referenceId } = data;

    // --- validation ---
    if (!productId){
        throw new Error('Product ID is required');        
    }

    if (!Number.isInteger(quantity) || quantity <= 0){
        throw new Error('Quantity must be positive integer');
    }

    if (!referenceType || !referenceId) {
        throw new Error('Reference type and ID are required')
    }

    // --- business rule ---
    // any authenticated user can consume stock,
    // but we log who triggered it

    await inventoryRepo.adjustStock({
        productId,
        type: 'OUT',
        quantity,
        reference: `${referenceType}:${referenceId}`,
        userId: user?.id
    });
}