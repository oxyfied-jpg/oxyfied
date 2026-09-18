export type StorageProviderType = 'google_drive' | 'local';

export type FileCategoryType = 'resource' | 'note' | 'submission';

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string | null;
  expiryDate?: number | bigint | null;
  email?: string;
  folderId?: string | null;
  scope?: string | null;
}

export interface CreateUploadSessionParams {
  fileName: string;
  fileSize: number;
  mimeType: string;
  categoryName?: string;
  courseTitle?: string;
  fileType?: FileCategoryType;
  userEmail?: string;
  lessonId?: string;
  oauthAccount?: OAuthCredentials | null;
  clientOrigin?: string;
}

export interface UploadSessionResult {
  provider: StorageProviderType;
  uploadUrl: string;
  fileId?: string;
  expiresAt?: string;
  targetFolderId?: string;
}

export interface CompleteUploadParams {
  fileId: string;
  fileName?: string;
  fileSize?: string | number;
  mimeType?: string;
  fileType?: FileCategoryType;
  oauthAccount?: OAuthCredentials | null;
}

export interface FileMetadataResult {
  id: string;
  name: string;
  size: string;
  sizeBytes?: number;
  mimeType: string;
  downloadUrl?: string;
  webContentLink?: string;
  webViewLink?: string;
  provider: StorageProviderType;
  createdAt?: string;
}

export interface IStorageService {
  readonly provider: StorageProviderType;
  isReady(oauthAccount?: OAuthCredentials | null): boolean;
  createUploadSession(params: CreateUploadSessionParams): Promise<UploadSessionResult>;
  verifyAndCompleteUpload(params: CompleteUploadParams): Promise<FileMetadataResult>;
  getDownloadUrl(fileId: string, fileName?: string, oauthAccount?: OAuthCredentials | null): Promise<string>;
  getDownloadStream?(fileId: string, oauthAccount?: OAuthCredentials | null): Promise<any>;
  deleteFile(fileId: string, oauthAccount?: OAuthCredentials | null): Promise<boolean>;
  getFileMetadata(fileId: string, oauthAccount?: OAuthCredentials | null): Promise<FileMetadataResult | null>;
  uploadBufferDirect?(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    categoryName?: string,
    fileType?: FileCategoryType,
    oauthAccount?: OAuthCredentials | null
  ): Promise<FileMetadataResult>;
}
