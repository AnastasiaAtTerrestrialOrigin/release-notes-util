import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface FileAPI {
  /**
   * Reads a JSON file from the given file path.
   * @param filePath The path to the JSON file.
   * @returns A promise that resolves with the parsed JSON data.
   */
  readJSON: (filePath: string) => Promise<any>;

  /**
   * Saves data as JSON to the given file path.
   * @param filePath The path to save the JSON file.
   * @param data The data to save.
   * @returns A promise that resolves with true if saving was successful.
   */
  saveJSON: (filePath: string, data: any) => Promise<boolean>;
}

export const fileAPI: FileAPI = {
  readJSON: async (filePath: string): Promise<any> => {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Optionally, log the error or handle it accordingly
      throw new Error(`Failed to read JSON file at ${filePath}: ${error}`);
    }
  },

  saveJSON: async (filePath: string, data: any): Promise<boolean> => {
    let tmpFile = '';  // Initialize with empty string
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      
      // Create directory path if it doesn't exist
      const dirPath = path.dirname(filePath);
      if (dirPath) {
        await fs.mkdir(dirPath, { recursive: true });
      }

      // Create a temporary file in the same directory
      tmpFile = path.join(
        path.dirname(filePath),
        `.${path.basename(filePath)}.${crypto.randomBytes(6).toString('hex')}.tmp`
      );

      // Write to temporary file
      await fs.writeFile(tmpFile, jsonStr, 'utf-8');
      
      // Atomically rename temporary file to target file
      await fs.rename(tmpFile, filePath);
      
      return true;
    } catch (error) {
      if (tmpFile) {
        try {
          await fs.unlink(tmpFile);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw new Error(`Failed to write JSON file at ${filePath}: ${error}`);
    }
  },
};

export default fileAPI;