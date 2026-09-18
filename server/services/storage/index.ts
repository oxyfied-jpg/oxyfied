import { GoogleDriveStorage } from './googleDriveStorage.js';
import { LocalStorage } from './localStorage.js';
import { IStorageService } from './storage.types.js';

export * from './storage.types.js';
export * from './googleDriveStorage.js';
export * from './localStorage.js';

class StorageFactory {
  private static googleDriveInstance: GoogleDriveStorage | null = null;
  private static localInstance: LocalStorage | null = null;

  public static isGoogleDriveConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    return !!(clientId && clientSecret);
  }

  public static getGoogleDriveStorage(): GoogleDriveStorage {
    if (!this.googleDriveInstance) {
      this.googleDriveInstance = new GoogleDriveStorage();
    }
    return this.googleDriveInstance;
  }

  public static getLocalStorage(): LocalStorage {
    if (!this.localInstance) {
      this.localInstance = new LocalStorage();
    }
    return this.localInstance;
  }

  public static getStorage(): IStorageService {
    if (this.isGoogleDriveConfigured()) {
      return this.getGoogleDriveStorage();
    }
    return this.getLocalStorage();
  }
}

export const storageService = StorageFactory.getStorage();
export const isGoogleDriveConfigured = StorageFactory.isGoogleDriveConfigured.bind(StorageFactory);
export const getGoogleDriveStorage = StorageFactory.getGoogleDriveStorage.bind(StorageFactory);
export const getLocalStorage = StorageFactory.getLocalStorage.bind(StorageFactory);
export default storageService;
