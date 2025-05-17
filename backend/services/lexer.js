const moo = require('moo');

// Define language-specific lexer rules with improved patterns
const lexerRules = {
  javascript: {
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    multilineComment: /\/\*[\s\S]*?\*\//,
    number: /0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/,
    string: /"(?:\\["\\]|[^\n"\\])*"|'(?:\\['\\]|[^\n'\\])*'|`(?:\\[`\\]|[^`\\])*`/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    semicolon: ';',
    comma: ',',
    dot: '.',
    arrow: '=>',
    keywords: ['if', 'else', 'while', 'for', 'function', 'return', 'var', 'let', 'const', 'class', 'import', 'export', 'from', 'true', 'false', 'null', 'undefined', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'new', 'this', 'super', 'extends'],
    operator: ['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '>', '<', '>=', '<=', '&&', '||', '!', '++', '--', '+=', '-=', '*=', '/=', '%', '&', '|', '^', '~', '<<', '>>', '>>>', '...'],
    identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    NL: { match: /\n/, lineBreaks: true },
  },
  
  python: {
    WS: /[ \t]+/,
    comment: /#.*?$/,
    number: /0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/,
    string: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\["\\]|[^\n"\\])*"|'(?:\\['\\]|[^\n'\\])*'/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    colon: ':',
    comma: ',',
    dot: '.',
    keywords: ['if', 'else', 'elif', 'while', 'for', 'def', 'return', 'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'pass', 'break', 'continue', 'global', 'nonlocal', 'yield', 'async', 'await', 'raise', 'assert', 'del'],
    operator: ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '**', '//', '%', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '@', '@=', '&', '|', '^', '~', '<<', '>>', '...'],
    identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
    indent: /^[ \t]+/,
    dedent: /^[ \t]+$/,
    NL: { match: /\n/, lineBreaks: true },
  },
  
  c: {
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    multilineComment: /\/\*[\s\S]*?\*\//,
    number: /0[xX][0-9a-fA-F]+|0[0-7]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?[lLfF]?/,
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    char: /'(?:\\['\\]|[^\n'\\])*'/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    semicolon: ';',
    comma: ',',
    dot: '.',
    keywords: ['if', 'else', 'while', 'for', 'return', 'int', 'float', 'double', 'char', 'void', 'struct', 'typedef', 'switch', 'case', 'break', 'continue', 'default', 'do', 'const', 'static', 'extern', 'enum', 'goto', 'sizeof', 'volatile', 'register', 'union', 'auto', 'long', 'short', 'signed', 'unsigned', '_Bool', '_Complex', '_Imaginary', 'inline'],
    operator: ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '++', '--', '+=', '-=', '*=', '/=', '%', '&', '|', '^', '~', '<<', '>>', '->', '.'],
    identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
    preprocessor: /#[a-zA-Z]+/,
    NL: { match: /\n/, lineBreaks: true },
  },
  
  cpp: {
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    multilineComment: /\/\*[\s\S]*?\*\//,
    number: /0[xX][0-9a-fA-F]+|0[0-7]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?[lLfF]?/,
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    char: /'(?:\\['\\]|[^\n'\\])*'/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    semicolon: ';',
    comma: ',',
    dot: '.',
    keywords: ['if', 'else', 'while', 'for', 'return', 'int', 'float', 'double', 'char', 'void', 'struct', 'typedef', 'switch', 'case', 'break', 'continue', 'default', 'do', 'const', 'static', 'extern', 'enum', 'goto', 'sizeof', 'volatile', 'register', 'union', 'class', 'namespace', 'template', 'try', 'catch', 'throw', 'using', 'new', 'delete', 'this', 'virtual', 'friend', 'private', 'public', 'protected', 'inline', 'bool', 'true', 'false', 'nullptr', 'auto', 'decltype', 'constexpr', 'explicit', 'export', 'typeid', 'alignas', 'alignof', 'mutable', 'noexcept', 'operator', 'override', 'final', 'thread_local'],
    operator: ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '++', '--', '+=', '-=', '*=', '/=', '%', '&', '|', '^', '~', '<<', '>>', '->', '::', '->*', '.*', '<=>'],
    identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
    preprocessor: /#[a-zA-Z]+/,
    NL: { match: /\n/, lineBreaks: true },
  },
  
  java: {
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    multilineComment: /\/\*[\s\S]*?\*\//,
    number: /0[xX][0-9a-fA-F]+|0[0-7]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?[lLfFdD]?/,
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    char: /'(?:\\['\\]|[^\n'\\])*'/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    semicolon: ';',
    comma: ',',
    dot: '.',
    keywords: ['if', 'else', 'while', 'for', 'return', 'int', 'float', 'double', 'char', 'void', 'boolean', 'String', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'abstract', 'private', 'public', 'protected', 'package', 'import', 'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'instanceof', 'switch', 'case', 'default', 'break', 'continue', 'enum', 'synchronized', 'volatile', 'transient', 'native', 'true', 'false', 'null', 'byte', 'short', 'long', 'strictfp', 'assert', 'const', 'goto'],
    operator: ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '++', '--', '+=', '-=', '*=', '/=', '%', '&', '|', '^', '~', '<<', '>>', '>>>', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=', '->'],
    identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    annotation: /@[a-zA-Z][a-zA-Z0-9]*/,
    NL: { match: /\n/, lineBreaks: true },
  }
};

// Detect language-specific identifiers and reserved words
const isLanguageSpecificIdentifier = (language, identifier) => {
  switch(language) {
    case 'javascript':
      // Check for JavaScript built-in objects and functions
      return ['console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Map', 'Set', 'Promise', 'JSON', 'Error'].includes(identifier);
    
    case 'python':
      // Check for Python built-in functions and modules
      return ['print', 'input', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'map', 'filter', 'reduce', 'sum', 'max', 'min', 'sorted', 'zip', 'enumerate', 'open', 'file', 'os', 'sys', 'math', 'random', 're', 'datetime', 'collections'].includes(identifier);
      
    case 'c':
      // Check for C built-in functions and libraries
      return ['printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc', 'sizeof', 'strlen', 'strcpy', 'strcmp', 'strcat', 'memcpy', 'memmove', 'memset', 'FILE', 'stdin', 'stdout', 'stderr', 'fopen', 'fclose', 'fread', 'fwrite', 'getchar', 'putchar'].includes(identifier);
      
    case 'cpp':
      // Check for C++ built-in objects and functions
      return ['cout', 'cin', 'endl', 'string', 'vector', 'map', 'set', 'list', 'queue', 'stack', 'deque', 'pair', 'algorithm', 'iterator', 'iostream', 'fstream', 'sstream'].includes(identifier);
      
    case 'java':
      // Check for Java built-in classes and methods
      return ['System', 'String', 'Integer', 'Double', 'Boolean', 'Character', 'Math', 'Object', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Scanner', 'File', 'Exception', 'StringBuilder', 'StringBuffer', 'Thread', 'Runnable', 'Comparable', 'Comparator', 'Collections', 'Arrays', 'Stream', 'Optional'].includes(identifier);
      
    default:
      return false;
  }
};

// Enhanced helper function to get the token type
const getTokenType = (language, token) => {
  const rules = lexerRules[language];
  
  if (!rules) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  // Special handling for identifiers that might be language-specific constructs
  if (token.type === 'identifier') {
    // Check if it's a keyword
    if (rules.keywords.includes(token.value)) {
      return 'keyword';
    }
    
    // Check if it's a language-specific identifier
    if (isLanguageSpecificIdentifier(language, token.value)) {
      return 'builtIn';
    }
    
    return 'identifier';
  }
  
  // For operators
  if (rules.operator.includes(token.value)) {
    return 'operator';
  }
  
  // For preprocessor directives in C/C++
  if ((language === 'c' || language === 'cpp') && token.type === 'preprocessor') {
    return 'preprocessor';
  }
  
  // For annotations in Java
  if (language === 'java' && token.type === 'annotation') {
    return 'annotation';
  }
  
  return token.type;
};

// Enhanced tokenize function
const tokenize = (code, language = 'javascript') => {
  if (!lexerRules[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  const rules = lexerRules[language];
  const lexer = moo.compile(rules);
  
  lexer.reset(code);
  
  const tokens = [];
  let token;
  
  try {
    while ((token = lexer.next())) {
      // Skip whitespace and newlines unless in Python (where indentation matters)
      if ((token.type === 'WS' || token.type === 'NL') && language !== 'python') {
        continue;
      }
      
      const tokenType = getTokenType(language, token);
      
      tokens.push({
        type: tokenType,
        value: token.value,
        line: token.line,
        col: token.col,
      });
    }
  } catch (error) {
    console.error('Tokenization error:', error);
    throw error;
  }
  
  // Process Python indentation (simplified)
  if (language === 'python') {
    // This is a simplified approach, a real implementation would track indentation levels
    let currentIndentation = 0;
    const processedTokens = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token.type === 'indent') {
        const indentationLevel = token.value.length;
        if (indentationLevel > currentIndentation) {
          processedTokens.push({ 
            type: 'indent', 
            value: 'INDENT', 
            line: token.line, 
            col: token.col 
          });
          currentIndentation = indentationLevel;
        } else if (indentationLevel < currentIndentation) {
          processedTokens.push({ 
            type: 'dedent', 
            value: 'DEDENT', 
            line: token.line, 
            col: token.col 
          });
          currentIndentation = indentationLevel;
        }
      } else {
        processedTokens.push(token);
      }
    }
    
    return processedTokens;
  }
  
  return tokens;
};

module.exports = {
  tokenize,
  isLanguageSpecificIdentifier
}; 