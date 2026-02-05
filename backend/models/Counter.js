// src/models/Counter.js

import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
        key: {
            type: String,
            required: true,
            enum: ['client', 'employee']
        },
        branch: {
            type: String,
            required: true
        },
        seq: {
            type: Number, 
            default: 0
        }
    }, {timestamps: true});

counterSchema.index(
    {key: 1, branch: 1},
    {unique: true}
);

export default mongoose.model('Counter', counterSchema);