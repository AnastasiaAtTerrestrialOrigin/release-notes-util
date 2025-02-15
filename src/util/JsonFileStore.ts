import { promises as fs } from 'fs';

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
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      // Create directory path if it doesn't exist
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dirPath) {
        await fs.mkdir(dirPath, { recursive: true });
      }
      await fs.writeFile(filePath, jsonStr, 'utf-8');
      return true;
    } catch (error) {
      // Optionally, log the error or handle it accordingly
      throw new Error(`Failed to write JSON file at ${filePath}: ${error}`);
    }
  },
};

export default fileAPI;