const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs/promises');
const path = require('path');
const AdmZip = require('adm-zip');

// Just for testing - won't actually upload to AWS
const MOCK_MODE = true;

async function testLambdaUpload() {
  try {
    console.log('Creating test Lambda package');
    
    // Create a simple test zip file
    const tempDir = path.join(process.cwd(), 'lambda-test-dir');
    const zipPath = path.join(process.cwd(), 'lambda-test.zip');
    
    // Create test directory and file
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(path.join(tempDir, 'index.js'), 'exports.handler = async () => "Hello World";');
    
    // Create zip file
    const zip = new AdmZip();
    zip.addLocalFolder(tempDir);
    zip.writeZip(zipPath);
    
    console.log('Testing different methods of handling the zip file');
    
    // Read zip file
    const zipFileContent = await fs.readFile(zipPath);
    console.log(`Zip file size: ${zipFileContent.length} bytes`);
    
    // Test different ways to prepare the zip content
    const methods = [
      { 
        name: 'Original Buffer', 
        prepare: () => zipFileContent 
      },
      { 
        name: 'Buffer.from()', 
        prepare: () => Buffer.from(zipFileContent) 
      },
      { 
        name: 'Uint8Array', 
        prepare: () => new Uint8Array(zipFileContent) 
      }
    ];
    
    // Configure Lambda client
    const client = new LambdaClient({
      region: 'us-east-1',
      // For testing only - won't actually connect
      credentials: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      }
    });

    // Try each method
    for (const method of methods) {
      console.log(`\nTrying method: ${method.name}`);
      
      const zipBuffer = method.prepare();
      console.log(`Type: ${typeof zipBuffer}`);
      console.log(`Is Buffer: ${Buffer.isBuffer(zipBuffer)}`);
      console.log(`Is Uint8Array: ${zipBuffer instanceof Uint8Array}`);
      
      const codeInput = {
        FunctionName: 'test-function',
        ZipFile: zipBuffer,
        DryRun: true
      };
      
      const command = new UpdateFunctionCodeCommand(codeInput);
      
      try {
        if (MOCK_MODE) {
          console.log('Mock mode: Not sending actual request');
          
          // Simulate what AWS SDK does internally
          console.log('Simulating AWS SDK serialization...');
          const serialized = JSON.stringify(codeInput);
          console.log(`Serialization ${serialized.includes('[object Object]') ? 'FAILED' : 'succeeded'}`);
        } else {
          console.log('Sending request to AWS...');
          const response = await client.send(command);
          console.log('Request successful!');
        }
      } catch (error) {
        console.error(`Error with ${method.name}: ${error.message}`);
      }
    }
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(zipPath);
    
    console.log('\nTest completed');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

testLambdaUpload();
