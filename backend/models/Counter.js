const mongoose = require('mongoose');

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

module.exports = mongoose.model('Counter', counterSchema);
