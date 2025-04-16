const mongoose = require('mongoose');

// Yaş aralığı şeması
const ageRangeSchema = new mongoose.Schema({
    minAge: {
        type: Number,
        required: true
    },
    maxAge: {
        type: Number,
        required: true
    },
    geometricMean: {
        type: Number,
        required: true
    },
    geometricSD: {
        type: Number,
        required: true
    },
    mean: {
        type: Number,
        required: true
    },
    sd: {
        type: Number,
        required: true
    },
    minValue: {
        type: Number,
        required: true
    },
    maxValue: {
        type: Number,
        required: true
    },
    confidenceLow: {
        type: Number,
        required: true
    },
    confidenceHigh: {
        type: Number,
        required: true
    }
});

// Test şeması
const testSchema = new mongoose.Schema({
    testName: {
        type: String,
        required: true
    },
    ageRanges: [ageRangeSchema]
});

// Ana kılavuz şeması
const guideSchema = new mongoose.Schema({
    guideName: {
        type: String,
        required: true,
        unique: true
    },
    tests: [testSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);
