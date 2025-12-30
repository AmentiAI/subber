// Script to create default.js for Prisma 7 compatibility
const fs = require('fs');
const path = require('path');

const defaultJsPath = path.join(__dirname, '../node_modules/.prisma/client/default.js');
const clientTsPath = path.join(__dirname, '../node_modules/.prisma/client/client.ts');
const classTsPath = path.join(__dirname, '../node_modules/.prisma/client/internal/class.ts');

if (fs.existsSync(clientTsPath)) {
  // Read the actual config from class.ts to get the correct runtimeDataModel
  let runtimeDataModel = { models: {}, enums: {}, types: {} };
  
  try {
    // Try to read the class.ts file and extract the runtimeDataModel
    const classContent = fs.readFileSync(classTsPath, 'utf8');
    // Look for config.runtimeDataModel = JSON.parse("...")
    // The JSON string has escaped quotes, so we need to match the whole parse call
    const jsonMatch = classContent.match(/config\.runtimeDataModel\s*=\s*JSON\.parse\("([^"]*(?:\\.[^"]*)*)"\)/);
    if (jsonMatch && jsonMatch[1]) {
      // The JSON string is escaped: \" becomes ", \\ becomes \
      let jsonStr = jsonMatch[1];
      // Unescape the string properly
      jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      runtimeDataModel = JSON.parse(jsonStr);
      console.log('✓ Extracted runtimeDataModel from class.ts');
    } else {
      // The runtime will populate it from the schema at runtime
      // This is actually fine - Prisma 7 can work without it pre-populated
      console.log('Note: runtimeDataModel will be populated at runtime');
    }
  } catch (e) {
    // If we can't read it, the runtime will populate it from DATABASE_URL
    console.warn('Could not read runtimeDataModel from class.ts:', e.message);
  }

  // Create the default.js file that properly exports PrismaClient using runtime
  const content = `// Prisma 7 default.js - Auto-generated bridge file
// This exports PrismaClient using the Prisma runtime API

const runtime = require('@prisma/client/runtime/client');

// Base config - matches what's in internal/class.ts
const config = {
  previewFeatures: [],
  clientVersion: "7.2.0",
  engineVersion: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  activeProvider: "postgresql",
  inlineSchema: "",
  runtimeDataModel: ${JSON.stringify(runtimeDataModel, null, 2)}
};

// Get the PrismaClient class from runtime
const PrismaClient = runtime.getPrismaClient(config);

// Export PrismaClient
module.exports.PrismaClient = PrismaClient;

// Also export enums
try {
  const enums = require('./enums');
  Object.assign(module.exports, enums);
} catch (e) {
  // Enums might not be available
}
`;
  
  fs.writeFileSync(defaultJsPath, content);
  console.log('✓ Created Prisma default.js bridge file');
}

