// src/repositories/inventory.repo.js
// stock_levels, movements

import sql from '../config/db.js';

/*
    READ (VIEWS ONLY)
*/ 

export function listProducts(){
    return sql`
        SELECT *
        FROM inventory.v_product_stock
        WHERE is_active = true
        ORDER BY name;
    `;
}

export async function getProductById(productId) {
    const [product] = await sql`
        SELECT *
        FROM inventory.v_product_stock
        WHERE product_id = ${productId}
        LIMIT 1;
    `;

    return product || null;
}

export function listMovements({ productId, limit = 50 }) {
    return sql`
        SELECT *
        FROM inventory.v_stock_movements
        ${productId ? sql`WHERE product_id = ${productId}` : sql``}
        ORDER BY created_at DESC
        LIMIT ${limit};
    `;
}

export function lowStock(){
    return sql`
        SELECT *
        FROM inventory.v_low_stock
        ORDER BY quantity ASC, name;
    `;
}

export async function getTotalStock(productId){
    const result = await sql`
        SELECT COALESCE(quantity, 0) AS quantity
          FROM inventory.v_product_stock
         WHERE product_id = ${productId}
    `;

    return result.length ? Number(result[0].quantity) : 0;
}

/*
    WRITE (FUNCTION ONLY)
*/ 

export function adjustStock({
    productId,
    type,
    quantity,
    reference,
    userId
}) {   
    return sql`
        SELECT inventory.adjust_stock(
            ${productId},
            ${type},
            ${quantity},
            ${reference || null}
        );
    `;
}