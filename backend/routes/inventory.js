// src/routes/inventory.js

import express from 'express';
import * as inventoryController from '../src/controllers/inventory.controller.js'; // POSTGRES
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();

/*
   READ
*/ 
router.get(
    '/products',
    verify,
    inventoryController.listProducts
);

router.get(
    '/products/:id',
    verify,
    inventoryController.getProduct
);

router.get(
    '/movements',
    verify,
    verifyAdmin,
    inventoryController.listMovements
);

router.get(
    '/low-stock',
    verify,
    verifyAdmin,
    inventoryController.lowStock
);


/*
   WRITE
*/ 
router.post(
    '/adjust',
    verify,
    verifyAdmin,
    inventoryController.adjustStock
);

router.post(
    '/consume',
    verify,
    inventoryController.consumeStock
);

export default router;