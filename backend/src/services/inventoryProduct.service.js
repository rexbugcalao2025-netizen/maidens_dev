// src/services/inventoryProduct.service.js
// sync from MongoDB

import { upsertInventoryProduct } from '../repositories/inventoryProduct.repo.js';
import * as inventoryRepo from '../repositories/inventory.repo.js';

export async function syncInventoryProductFromMongo(productDoc){
    if(!productDoc?._id){
        throw new Error('Invalid product document');
    }

    await upsertInventoryProduct({
        product_id: productDoc._id.toString(),
        product_name: productDoc.name,
        description: productDoc.description ?? null,
        price: productDoc.price ?? 0,
        category_id: productDoc.category_id ?? null,
        category_name: productDoc.category ?? null,
        sub_category_id: productDoc.sub_category_id ?? null,
        sub_category_name: productDoc.sub_category ?? null,
        sku: productDoc.sku ?? null,
        unit: productDoc.unit ?? null,
        is_active: productDoc.is_active ?? true,
        is_deleted: productDoc.is_deleted ?? false
    });
}

export async function hasStock(productId){
    const qty = await inventoryRepo.getTotalStock(productId);
    return qty > 0;
}