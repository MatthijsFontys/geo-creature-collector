import { describe, it, expect, beforeAll } from 'vitest';
import Ajv from 'ajv/dist/2020';
import * as fs from 'fs/promises';
import * as path from 'path';
import pinoLogger from '../../middleware/logger';

const schemaPath = './src/websockets/spawners/geo-spawner-json-schema.json';
const spawnersDir = './src/websockets/spawners';
const logger = pinoLogger.child({by: 'spawner.test.ts'})

async function findJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    const isJson = path.extname(entry.name) === '.json';
    const isNoSchema = !entry.name.toLowerCase().endsWith('schema.json');

    if(entry.isDirectory()) {
      const subFiles = await findJsonFiles(fullPath);
      files.push(...subFiles);
    }
    else if (isJson && isNoSchema) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Spawner JSON files', () => {
  let schemaJson: any;
  let ajv: Ajv;

  beforeAll(async () => {
    const schemaFilePath = path.resolve(schemaPath);
    const schemaFileContents = await fs.readFile(schemaFilePath, 'utf8');
    schemaJson = JSON.parse(schemaFileContents);

    ajv = new Ajv({
      strict: false,
      validateSchema: true,
      allowUnionTypes: true,
    });

    const validate = ajv.compile(schemaJson);
    if (!validate) {
      throw new Error('Invalid schema');
    }
  });

  it('should validate all spawner JSON files', async () => {
    const jsonFiles = await findJsonFiles(path.resolve(spawnersDir));

    for (const jsonFilePath of jsonFiles) {
      const fileContents = await fs.readFile(jsonFilePath, 'utf8');
      let spawnerJson: string;
      try {
        spawnerJson = JSON.parse(fileContents);
      } catch (parseError) {
        expect.fail(`Failed to parse JSON in file ${path.basename(jsonFilePath)}: ${parseError instanceof Error ? parseError.message : parseError}`);
      }

      const validate = ajv.compile(schemaJson);
      const isValid = validate(spawnerJson);

      if (!isValid) {
        logger.warn(`Validation errors in ${jsonFilePath}:`, validate.errors);
      }

      expect(isValid,`File ${path.basename(jsonFilePath)} should be valid`).toBe(true);
    }
  });
});
