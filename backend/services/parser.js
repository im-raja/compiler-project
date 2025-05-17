const nearley = require('nearley');

// Simple parser for arithmetic expressions and basic functions
// This is a basic implementation for demonstration purposes

// Function to check if tokens match our grammar
const parse = (tokens, language) => {
  // Basic recursive descent parser implementation
  try {
    let currentPosition = 0;
    const errors = [];

    // Helper function to check if we're at the end of the tokens
    const isAtEnd = () => currentPosition >= tokens.length;

    // Helper function to peek at the current token
    const peek = () => isAtEnd() ? null : tokens[currentPosition];

    // Helper function to peek ahead n tokens
    const peekAhead = (n) => {
      if (currentPosition + n >= tokens.length) return null;
      return tokens[currentPosition + n];
    };

    // Helper function to advance to the next token
    const advance = () => {
      if (!isAtEnd()) currentPosition++;
      return tokens[currentPosition - 1];
    };

    // Helper function to check if the current token type matches expected type
    const match = (type) => {
      if (isAtEnd()) return false;
      if (peek().type === type) {
        advance();
        return true;
      }
      return false;
    };

    // Helper to check if current token value matches
    const matchValue = (value) => {
      if (isAtEnd()) return false;
      if (peek().value === value) {
        advance();
        return true;
      }
      return false;
    };

    // Helper function to expect a certain token type, or record an error
    const expect = (type, message) => {
      if (match(type)) return true;
      
      const token = peek();
      errors.push({
        message,
        line: token ? token.line : 'unknown',
        col: token ? token.col : 'unknown',
        expected: type,
        found: token ? token.type : 'end of input'
      });
      return false;
    };

    // Try to parse as an expression first
    const tryParse = () => {
      const backupPosition = currentPosition;
      
      try {
        // Try statement or expression
        if (peek() && peek().type === 'keyword' && 
            (peek().value === 'function' || peek().value === 'def' || peek().value === 'int')) {
          parseFunctionOrMethod();
          return true;
        } else {
          expression();
          return true;
        }
      } catch (e) {
        // Restore position and try another rule
        currentPosition = backupPosition;
        return false;
      }
    };

    // Parse a function declaration
    const parseFunctionOrMethod = () => {
      // Consume 'function' or 'def' keyword or return type for C/Java
      advance();
      
      // Function name should be an identifier
      if (!match('identifier')) {
        const token = peek();
        errors.push({
          message: "Expected function name (identifier)",
          line: token ? token.line : 'unknown',
          col: token ? token.col : 'unknown',
          expected: 'identifier',
          found: token ? token.type : 'end of input'
        });
      }
      
      // Open parenthesis
      if (!matchValue('(')) {
        const token = peek();
        errors.push({
          message: "Expected '(' after function name",
          line: token ? token.line : 'unknown',
          col: token ? token.col : 'unknown',
          expected: '(',
          found: token ? token.value : 'end of input'
        });
      }
      
      // Parameters (simplified)
      while (peek() && peek().value !== ')') {
        // Parameter name
        if (!match('identifier')) {
          const token = peek();
          errors.push({
            message: "Expected parameter name",
            line: token ? token.line : 'unknown',
            col: token ? token.col : 'unknown',
            expected: 'identifier',
            found: token ? token.type : 'end of input'
          });
          break;
        }
        
        // Optional comma between parameters
        if (peek() && peek().value === ',') {
          advance();
        } else if (peek() && peek().value !== ')') {
          const token = peek();
          errors.push({
            message: "Expected ',' or ')' after parameter",
            line: token ? token.line : 'unknown',
            col: token ? token.col : 'unknown',
            expected: ", or )",
            found: token ? token.value : 'end of input'
          });
          break;
        }
      }
      
      // Close parenthesis
      if (!matchValue(')')) {
        const token = peek();
        errors.push({
          message: "Expected ')' after parameters",
          line: token ? token.line : 'unknown',
          col: token ? token.col : 'unknown',
          expected: ')',
          found: token ? token.value : 'end of input'
        });
      }
      
      // For Python, expect colon
      if (language === 'python' && !matchValue(':')) {
        const token = peek();
        errors.push({
          message: "Expected ':' after function declaration",
          line: token ? token.line : 'unknown',
          col: token ? token.col : 'unknown',
          expected: ':',
          found: token ? token.value : 'end of input'
        });
      }
      
      // Optional function body
      if (peek() && peek().value === '{') {
        advance(); // {
        
        // Simplified parsing of function body - just skip tokens until we find closing brace
        while (peek() && peek().value !== '}') {
          if (peek().value === 'return') {
            advance(); // consume 'return'
            expression(); // parse return expression
            if (peek() && peek().value === ';') {
              advance(); // consume semicolon
            }
          } else {
            advance(); // Skip other tokens inside function body
          }
        }
        
        if (peek() && peek().value === '}') {
          advance(); // consume closing brace
        } else {
          const token = peek();
          errors.push({
            message: "Expected '}' at end of function body",
            line: token ? token.line : 'unknown',
            col: token ? token.col : 'unknown',
            expected: '}',
            found: token ? token.value : 'end of input'
          });
        }
      }
    };

    // Grammar rules implementation (recursive descent parser)
    // This is a simplified grammar for basic expressions
    
    // expression → term (('+' | '-') term)*
    const expression = () => {
      term();
      
      while (peek() && (peek().value === '+' || peek().value === '-')) {
        advance(); // consume the operator
        term();
      }
    };
    
    // term → factor (('*' | '/') factor)*
    const term = () => {
      factor();
      
      while (peek() && (peek().value === '*' || peek().value === '/')) {
        advance(); // consume the operator
        factor();
      }
    };
    
    // factor → NUMBER | IDENTIFIER | '(' expression ')'
    const factor = () => {
      if (match('number')) {
        return;
      } else if (match('identifier')) {
        return;
      } else if (peek() && peek().value === '(') {
        advance(); // consume '('
        expression();
        if (!expect('rparen', "Expected ')' after expression")) {
          // Error handling, already recorded in errors array
        }
      } else {
        const token = peek();
        errors.push({
          message: "Expected number, identifier, or '('",
          line: token ? token.line : 'unknown',
          col: token ? token.col : 'unknown',
          expected: 'number, identifier, or (',
          found: token ? token.value : 'end of input'
        });
        
        // Skip current token to continue parsing
        if (!isAtEnd()) advance();
      }
    };

    // Start the parsing process
    tryParse();

    // If we haven't consumed all tokens and there are no errors,
    // that's a syntax error (unexpected tokens at the end)
    if (!isAtEnd() && errors.length === 0) {
      const token = peek();
      errors.push({
        message: "Unexpected token at the end",
        line: token.line,
        col: token.col,
        expected: 'end of input',
        found: token.value
      });
    }

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Parsing error:', error);
    return {
      success: false,
      errors: [{ message: error.message }]
    };
  }
};

// Generate AST from the tokens
const generateAST = (tokens, language) => {
  try {
    // Simple AST generator for demonstration
    // In a real-world scenario, you'd want to build a proper AST during parsing
    
    let currentPosition = 0;
    
    // Helper function to check if we're at the end of the tokens
    const isAtEnd = () => currentPosition >= tokens.length;
    
    // Helper function to peek at the current token
    const peek = () => isAtEnd() ? null : tokens[currentPosition];
    
    // Helper function to advance to the next token
    const advance = () => {
      if (!isAtEnd()) currentPosition++;
      return tokens[currentPosition - 1];
    };
    
    // Helper function to build a binary expression node
    const buildBinaryExpr = (left, operator, right) => {
      return {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
      };
    };
    
    // Helper function to build a literal node
    const buildLiteral = (value, type) => {
      return {
        type: type === 'number' ? 'NumericLiteral' : 'Identifier',
        value: value
      };
    };
    
    // Grammar rules implementation for AST generation
    
    // expression → term (('+' | '-') term)*
    const expression = () => {
      let expr = term();
      
      while (peek() && (peek().value === '+' || peek().value === '-')) {
        const operator = advance().value;
        const right = term();
        expr = buildBinaryExpr(expr, operator, right);
      }
      
      return expr;
    };
    
    // term → factor (('*' | '/') factor)*
    const term = () => {
      let expr = factor();
      
      while (peek() && (peek().value === '*' || peek().value === '/')) {
        const operator = advance().value;
        const right = factor();
        expr = buildBinaryExpr(expr, operator, right);
      }
      
      return expr;
    };
    
    // factor → NUMBER | IDENTIFIER | '(' expression ')'
    const factor = () => {
      if (peek() && peek().type === 'number') {
        const token = advance();
        return buildLiteral(token.value, 'number');
      } else if (peek() && peek().type === 'identifier') {
        const token = advance();
        return buildLiteral(token.value, 'identifier');
      } else if (peek() && peek().value === '(') {
        advance(); // consume '('
        const expr = expression();
        advance(); // consume ')'
        return expr;
      } else {
        // Error handling - for simplicity, return a placeholder node
        if (!isAtEnd()) advance(); // Skip invalid token
        return buildLiteral('ERROR', 'error');
      }
    };
    
    // Start the AST building process from the expression rule
    const ast = {
      type: 'Program',
      body: [expression()]
    };
    
    // Format AST for d3 visualization
    const formatASTForVisualization = (ast) => {
      const transformNode = (node) => {
        if (!node) return null;
        
        const result = { 
          name: node.type, 
          attributes: {} 
        };
        
        // Add relevant attributes based on node type
        if (node.type === 'BinaryExpression') {
          result.attributes.operator = node.operator;
          result.children = [
            transformNode(node.left),
            transformNode(node.right)
          ];
        } else if (node.type === 'NumericLiteral' || node.type === 'Identifier') {
          result.attributes.value = node.value;
        } else if (node.type === 'Program') {
          result.children = node.body.map(transformNode);
        }
        
        return result;
      };
      
      return transformNode(ast);
    };
    
    return formatASTForVisualization(ast);
  } catch (error) {
    console.error('AST generation error:', error);
    return {
      name: 'Error',
      attributes: { message: error.message }
    };
  }
};

module.exports = {
  parse,
  generateAST
}; 