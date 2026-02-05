import Counter from '../models/Counter.js';

/**
 * Generates:
 * FMHC-DVO-00001
 * FMHE-DVO-00001
 */

async function generateFMHCode({type, branch}){
    if (!['client','employee'].includes(type)){
        throw new Error('Invalid type for FMH code generation');
    }

    if (!branch || typeof branch !== 'string'){
        throw new Error("Branch is required");
    }

    const counter = await Counter.findOneAndUpdate(
        { key: type, branch },
        { $inc: {seq: 1} },
        { new: true, upsert: true }
    );

    const typeLetter = type === 'client' ? 'C': 'E';
    const paddedSeq = String(counter.seq).padStart(5,'0');

    return(`FMH${typeLetter}-${branch}-${paddedSeq}`);
}

// module.exports = generateFMHCode;

export default generateFMHCode;