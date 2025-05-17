const mongoose = require('mongoose');

const CompilationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'c', 'cpp', 'java'],
    required: true
  },
  tokens: {
    type: Array,
    default: []
  },
  ast: {
    type: Object,
    default: null
  },
  success: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Array,
    default: []
  },
  warnings: {
    type: Array,
    default: []
  },
  stage: {
    type: String,
    enum: ['tokenization', 'parsing', 'ast_generation', 'semantic_analysis', 'complete'],
    default: 'tokenization'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Compilation', CompilationSchema); 