import fs from 'fs';
import path from 'path';
import {
  IStorageService,
  StorageProviderType,
  CreateUploadSessionParams,
  UploadSessionResult,
  CompleteUploadParams,
  FileMetadataResult
} from './storage.types.js';

export class LocalStorage implements IStorageService {
  readonly provider: StorageProviderType = 'local';
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.VERCEL
      ? path.join('/tmp', 'uploads')
      : path.resolve('server/uploads');

    if (!fs.existsSync(this.uploadsDir)) {
      try {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } catch (e) {
        // Ignore in restricted environments
      }
    }
  }

  public isReady(): boolean {
    return true;
  }

  private formatFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  public async createUploadSession(params: CreateUploadSessionParams): Promise<UploadSessionResult> {
    const fileId = `local-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return {
      provider: 'local',
      uploadUrl: `/api/mentor/lessons/${params.lessonId || 'legacy'}/resources`,
      fileId
    };
  }

  public async verifyAndCompleteUpload(params: CompleteUploadParams): Promise<FileMetadataResult> {
    const sizeStr = params.fileSize ? (typeof params.fileSize === 'string' ? params.fileSize : this.formatFileSize(params.fileSize)) : '0 B';
    return {
      id: params.fileId,
      name: params.fileName || 'file',
      size: sizeStr,
      mimeType: params.mimeType || 'application/octet-stream',
      downloadUrl: `/api/resources/${params.fileId}/download`,
      provider: 'local'
    };
  }

  public async getDownloadStream(fileId: string): Promise<fs.ReadStream> {
    const filePath = path.resolve(this.uploadsDir, fileId);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found in local storage.');
    }
    return fs.createReadStream(filePath);
  }

  public async getDownloadUrl(fileId: string): Promise<string> {
    return `/api/resources/${fileId}/download`;
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    try {
      const filePath = path.resolve(this.uploadsDir, fileId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  public async getFileMetadata(fileId: string): Promise<FileMetadataResult | null> {
    try {
      const filePath = path.resolve(this.uploadsDir, fileId);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          id: fileId,
          name: fileId,
          size: this.formatFileSize(stats.size),
          sizeBytes: stats.size,
          mimeType: 'application/octet-stream',
          downloadUrl: `/api/resources/${fileId}/download`,
          provider: 'local'
        };
      }
    } catch {
      // Ignore
    }
    return null;
  }

  public async uploadBufferDirect(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<FileMetadataResult> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storedFileName = `${uniqueSuffix}-${safeName}`;
    const filePath = path.resolve(this.uploadsDir, storedFileName);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      // Disk write failed on serverless
    }

    return {
      id: storedFileName,
      name: fileName,
      size: this.formatFileSize(buffer.length),
      sizeBytes: buffer.length,
      mimeType,
      downloadUrl: `/uploads/${storedFileName}`,
      provider: 'local'
    };
  }
}
