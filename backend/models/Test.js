const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  tcNo: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['erkek', 'kadin'],
    required: true,
  },
  birthPlace: {
    type: String,
    required: true,
  },
  sampleTime: {
    type: Date,
    required: true,
  },
  tests: [{
    testName: {
      type: String,
      required: true,
    },
    testValue: {
      type: String,
      required: true,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Test', testSchema);
