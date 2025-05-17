const express = require('express');
const router = express.Router();
const { tokenize } = require('../services/lexer');
const { parse, generateAST } = require('../services/parser');
const { semanticAnalysis } = require('../services/semanticAnalyzer');
const { compileAndExecute } = require('../services/codeCompiler');

// Endpoint for tokenization
router.post('/tokenize', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const tokens = tokenize(code, language);
    return res.json({ tokens });
  } catch (error) {
    console.error('Tokenization error:', error);
    return res.status(500).json({ error: 'Tokenization failed', details: error.message });
  }
});

// Endpoint for parsing
router.post('/parse', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const tokens = tokenize(code, language);
    const parseResult = parse(tokens, language);
    
    return res.json({ success: parseResult.success, errors: parseResult.errors });
  } catch (error) {
    console.error('Parsing error:', error);
    return res.status(500).json({ error: 'Parsing failed', details: error.message });
  }
});

// Endpoint for generating AST
router.post('/generate-ast', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const tokens = tokenize(code, language);
    const parseResult = parse(tokens, language);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Cannot generate AST due to syntax errors', errors: parseResult.errors });
    }
    
    const ast = generateAST(tokens, language);
    return res.json({ ast });
  } catch (error) {
    console.error('AST generation error:', error);
    return res.status(500).json({ error: 'AST generation failed', details: error.message });
  }
});

// Endpoint for semantic analysis
router.post('/semantic-analysis', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const tokens = tokenize(code, language);
    const parseResult = parse(tokens, language);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Cannot perform semantic analysis due to syntax errors', errors: parseResult.errors });
    }
    
    const ast = generateAST(tokens, language);
    const semanticResult = semanticAnalysis(ast, language);
    
    return res.json({ 
      success: semanticResult.success, 
      errors: semanticResult.errors,
      warnings: semanticResult.warnings 
    });
  } catch (error) {
    console.error('Semantic analysis error:', error);
    return res.status(500).json({ error: 'Semantic analysis failed', details: error.message });
  }
});

// Endpoint for full compilation process
router.post('/compile', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Step 1: Tokenization
    const tokens = tokenize(code, language);
    
    // Step 2: Parsing
    const parseResult = parse(tokens, language);
    if (!parseResult.success) {
      return res.json({
        stage: 'parsing',
        success: false,
        tokens,
        errors: parseResult.errors
      });
    }
    
    // Step 3: AST Generation
    const ast = generateAST(tokens, language);
    
    // Step 4: Semantic Analysis
    const semanticResult = semanticAnalysis(ast, language);
    
    return res.json({
      stage: semanticResult.success ? 'complete' : 'semantic_analysis',
      success: semanticResult.success,
      tokens,
      ast,
      semanticErrors: semanticResult.errors,
      semanticWarnings: semanticResult.warnings
    });
  } catch (error) {
    console.error('Compilation error:', error);
    return res.status(500).json({ error: 'Compilation failed', details: error.message });
  }
});

// New endpoint for executing code
router.post('/execute', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // First do the tokenization, parsing, and semantic analysis
    const tokens = tokenize(code, language);
    const parseResult = parse(tokens, language);
    
    // Even if there are syntax errors, we'll still attempt compilation
    // to get compiler errors which are often more informative
    
    // Execute the code with the appropriate compiler/interpreter
    const executionResult = await compileAndExecute(code, language);
    
    return res.json({
      stage: 'execution',
      syntaxSuccess: parseResult.success,
      compilationSucceeded: executionResult.compilationSucceeded,
      stdout: executionResult.stdout,
      stderr: executionResult.stderr,
      tokens,
      syntaxErrors: parseResult.errors
    });
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ error: 'Execution failed', details: error.message });
  }
});

module.exports = router; 