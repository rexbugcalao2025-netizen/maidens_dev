// src/repositories/inventoryProduct.repo.js
// inventory.products


import sql from '../config/db.js'

export async function upsertInventoryProduct(data){

    const {
        product_id,
        product_name,
        description,
        price,
        category_id,
        category_name,
        sub_category_id,
        sub_category_name,
        sku,
        unit,
        is_active,
        is_deleted
    } = data;

    await sql`
        SELECT inventory.upsert_product(
            ${product_id},
            ${product_name},
            ${description},
            ${price},
            ${category_id},
            ${category_name},
            ${sub_category_id},
            ${sub_category_name},
            ${sku},
            ${unit},
            ${is_active},
            ${is_deleted}
        )
    `;
}