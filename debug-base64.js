const fs = require('fs/promises');
const path = require('path');
const { toBase64 } = require('@smithy/util-base64');

async function testBase64Encoding() {
  try {
    console.log('Testing base64 encoding with different input formats');
    
    // Create a simple test file
    const testContent = 'Hello Lambda Test';
    const testFilePath = path.join(process.cwd(), 'test-file.txt');
    await fs.writeFile(testFilePath, testContent);
    
    // Test 1: Read as Buffer and check type
    const fileBuffer = await fs.readFile(testFilePath);
    console.log('\nTest 1: Original Buffer from fs.readFile()');
    console.log(`Type: ${typeof fileBuffer}`);
    console.log(`Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
    console.log(`Is Uint8Array: ${fileBuffer instanceof Uint8Array}`);
    
    // Test 2: Try wrapping in Buffer.from()
    const wrappedBuffer = Buffer.from(fileBuffer);
    console.log('\nTest 2: Wrapped in Buffer.from()');
    console.log(`Type: ${typeof wrappedBuffer}`);
    console.log(`Is Buffer: ${Buffer.isBuffer(wrappedBuffer)}`);
    console.log(`Is Uint8Array: ${wrappedBuffer instanceof Uint8Array}`);
    
    // Test 3: Convert to Uint8Array
    const uint8Array = new Uint8Array(fileBuffer);
    console.log('\nTest 3: Converted to Uint8Array');
    console.log(`Type: ${typeof uint8Array}`);
    console.log(`Is Buffer: ${Buffer.isBuffer(uint8Array)}`);
    console.log(`Is Uint8Array: ${uint8Array instanceof Uint8Array}`);
    
    // Test 4: Base64 encoding tests
    console.log('\nTest 4: Base64 encoding tests');
    
    try {
      console.log('Original buffer to base64:');
      const base64Original = toBase64(fileBuffer);
      console.log('Success - result length: ' + base64Original.length);
    } catch (error) {
      console.error('Failed to encode original buffer:', error.message);
    }
    
    try {
      console.log('Buffer.from wrapped buffer to base64:');
      const base64Wrapped = toBase64(wrappedBuffer);
      console.log('Success - result length: ' + base64Wrapped.length);
    } catch (error) {
      console.error('Failed to encode wrapped buffer:', error.message);
    }
    
    try {
      console.log('Uint8Array to base64:');
      const base64Uint8 = toBase64(uint8Array);
      console.log('Success - result length: ' + base64Uint8.length);
    } catch (error) {
      console.error('Failed to encode Uint8Array:', error.message);
    }
    
    // Clean up
    await fs.unlink(testFilePath);
    console.log('\nTest completed');
    
  } catch (error) {
    console.error(`Error during test: ${error.message}`);
    console.error(error.stack);
  }
}

testBase64Encoding();
