const fs = require('fs/promises');
const path = require('path');
const AdmZip = require('adm-zip');
const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');

async function testZipFile() {
  try {
    // Create a test zip file
    const tempDir = path.join(process.cwd(), 'lambda-package-test');
    const zipPath = path.join(process.cwd(), 'lambda-function-test.zip');

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
    
    // Copy index.js to temp dir
    await fs.copyFile(
      path.join(process.cwd(), 'index.js'),
      path.join(tempDir, 'index.js')
    );

    // Create ZIP file using AdmZip
    console.log('Creating test ZIP file');
    const zip = new AdmZip();
    zip.addLocalFolder(tempDir);
    zip.writeZip(zipPath);
    
    // Read the ZIP as a Buffer (Uint8Array)
    console.log('Reading ZIP file as Buffer');
    const zipBuffer = await fs.readFile(zipPath);
    console.log(`ZIP file read as Buffer: Type=${typeof zipBuffer}, isBuffer=${Buffer.isBuffer(zipBuffer)}`);
    
    // The update call would look like this (not actually executing)
    console.log('AWS SDK would use this format for the ZipFile parameter:');
    console.log(`Type of data passed: ${typeof zipBuffer}`);
    console.log(`Is Buffer: ${Buffer.isBuffer(zipBuffer)}`);
    console.log(`Buffer length: ${zipBuffer.length}`);
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(zipPath);
    
    console.log('Test completed');
  } catch (error) {
    console.error(`Error during test: ${error.message}`);
    console.error(error.stack);
  }
}

testZipFile();
