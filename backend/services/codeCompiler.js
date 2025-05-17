const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Define compiler/interpreter commands for different languages
const compilerCommands = {
  javascript: {
    execute: (filePath) => `node ${filePath}`,
    fileExtension: '.js'
  },
  python: {
    execute: (filePath) => `python3 ${filePath}`,
    fileExtension: '.py'
  },
  c: {
    compile: (filePath, outputPath) => `gcc ${filePath} -o ${outputPath}`,
    execute: (outputPath) => `${outputPath}`,
    fileExtension: '.c'
  },
  cpp: {
    compile: (filePath, outputPath) => `g++ ${filePath} -o ${outputPath}`,
    execute: (outputPath) => `${outputPath}`,
    fileExtension: '.cpp'
  },
  java: {
    compile: (filePath) => `javac ${filePath}`,
    execute: (className, dir) => `cd ${dir} && java ${className}`,
    fileExtension: '.java'
  }
};

// Create temporary directory for compilation files
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating temp directory:', error);
    throw error;
  }
};

// Clean up temp files
const cleanupTempFiles = async (filePaths) => {
  try {
    for (const filePath of filePaths) {
      await fs.unlink(filePath).catch(() => {});
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Extract class name from Java code
const extractJavaClassName = (code) => {
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  if (classNameMatch && classNameMatch[1]) {
    return classNameMatch[1];
  }
  return 'Main'; // Default class name
};

// Compile and execute code
const compileAndExecute = async (code, language) => {
  if (!compilerCommands[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await ensureTempDir();
  const fileId = uuidv4();
  const filePaths = [];

  try {
    // Create source file
    const fileExtension = compilerCommands[language].fileExtension;
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(TEMP_DIR, fileName);
    filePaths.push(filePath);

    await fs.writeFile(filePath, code);

    let result = {
      stdout: '',
      stderr: '',
      compilationSucceeded: false
    };

    // Compile if needed (C, C++, Java)
    if (compilerCommands[language].compile) {
      switch (language) {
        case 'c':
        case 'cpp': {
          const outputPath = path.join(TEMP_DIR, fileId);
          filePaths.push(outputPath);
          
          const { stdout, stderr } = await exec(compilerCommands[language].compile(filePath, outputPath));
          
          if (stderr && stderr.length > 0) {
            result.stderr = stderr;
            return result;
          }
          
          result.compilationSucceeded = true;
          const { stdout: execStdout, stderr: execStderr } = await exec(compilerCommands[language].execute(outputPath));
          result.stdout = execStdout;
          result.stderr = execStderr;
          break;
        }
        case 'java': {
          const className = extractJavaClassName(code);
          const classFilePath = path.join(TEMP_DIR, `${className}.class`);
          filePaths.push(classFilePath);
          
          const { stdout, stderr } = await exec(compilerCommands[language].compile(filePath));
          
          if (stderr && stderr.length > 0) {
            result.stderr = stderr;
            return result;
          }
          
          result.compilationSucceeded = true;
          const { stdout: execStdout, stderr: execStderr } = await exec(compilerCommands[language].execute(className, TEMP_DIR));
          result.stdout = execStdout;
          result.stderr = execStderr;
          break;
        }
      }
    } else {
      // Interpreted languages (JavaScript, Python)
      result.compilationSucceeded = true;
      const { stdout, stderr } = await exec(compilerCommands[language].execute(filePath));
      result.stdout = stdout;
      result.stderr = stderr;
    }

    return result;
  } catch (error) {
    console.error(`Error compiling/executing ${language} code:`, error);
    return {
      stdout: '',
      stderr: error.message || 'Unknown error occurred during compilation/execution',
      compilationSucceeded: false
    };
  } finally {
    // Clean up temp files
    await cleanupTempFiles(filePaths);
  }
};

module.exports = {
  compileAndExecute
}; 