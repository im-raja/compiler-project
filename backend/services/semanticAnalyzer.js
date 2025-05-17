// Simple semantic analyzer for checking variable declarations and usage
// This is a basic implementation for demonstration purposes

const semanticAnalysis = (ast, language) => {
  try {
    const errors = [];
    const warnings = [];
    
    // Symbol table to track variables
    const symbolTable = new Map();
    
    // Helper function to traverse the AST
    const traverse = (node) => {
      if (!node) return;
      
      // Process node based on type
      if (node.name === 'Program' && node.children) {
        // Process program body
        node.children.forEach(child => traverse(child));
      } else if (node.name === 'BinaryExpression') {
        // Process binary expression
        if (node.children) {
          node.children.forEach(child => traverse(child));
        }
        
        // Check if the operation makes sense based on operand types
        // For demonstration, we'll just check simple cases
        if (node.attributes && node.attributes.operator) {
          const operator = node.attributes.operator;
          
          // For division, add warning for potential division by zero
          if (operator === '/' && 
              node.children && 
              node.children.length === 2 && 
              node.children[1].name === 'NumericLiteral' && 
              node.children[1].attributes && 
              node.children[1].attributes.value === '0') {
            warnings.push({
              message: 'Division by zero',
              severity: 'warning'
            });
          }
        }
      } else if (node.name === 'Identifier') {
        // Check if the identifier is defined
        const varName = node.attributes && node.attributes.value;
        
        if (varName && !symbolTable.has(varName)) {
          errors.push({
            message: `Undefined variable: ${varName}`,
            severity: 'error',
            variable: varName
          });
        }
      } else if (node.name === 'NumericLiteral') {
        // Nothing specific to check for numeric literals
      }
      
      // For other node types, process their children
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };
    
    // Start the traversal from the root
    traverse(ast);
    
    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('Semantic analysis error:', error);
    return {
      success: false,
      errors: [{ message: error.message, severity: 'error' }],
      warnings: []
    };
  }
};

module.exports = {
  semanticAnalysis
}; 