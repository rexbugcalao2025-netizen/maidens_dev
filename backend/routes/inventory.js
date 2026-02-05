// import express from 'express';
// import * as inventoryController from '../src/controllers/inventory.controller.js';
// import { verify, verifyAdmin } from  '../auth';

const express = require ('express');
const inventoryController = require('../src/controllers/inventory.controller.js');
const { verify, verifyAdmin } = require('../auth');

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