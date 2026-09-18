import { google, drive_v3 } from 'googleapis';
import axios from 'axios';
import { Readable } from 'stream';
import {
  IStorageService,
  StorageProviderType,
  CreateUploadSessionParams,
  UploadSessionResult,
  CompleteUploadParams,
  FileMetadataResult,
  FileCategoryType,
  OAuthCredentials
} from './storage.types.js';

export const REQUIRED_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
];

export class GoogleDriveStorage implements IStorageService {
  readonly provider: StorageProviderType = 'google_drive';
  private folderCache: Map<string, string> = new Map();

  public isOAuthConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    return !!(clientId && clientSecret);
  }

  public isScopeValid(scope?: string | null): boolean {
    if (!scope) return false;
    return (
      scope.includes('https://www.googleapis.com/auth/drive.file') ||
      scope.includes('https://www.googleapis.com/auth/drive')
    );
  }

  public isReady(oauthAccount?: OAuthCredentials | null): boolean {
    if (!this.isOAuthConfigured()) return false;
    if (!oauthAccount || (!oauthAccount.accessToken && !oauthAccount.refreshToken)) return false;
    if (oauthAccount.scope && !this.isScopeValid(oauthAccount.scope)) return false;
    return true;
  }

  /**
   * Helper to format Google Drive / Axios / Gaxios errors into friendly, actionable messages.
   */
  public formatDriveError(err: any): Error {
    const status = err?.status || err?.response?.status || err?.code;
    const message = err?.message || '';
    const details = typeof err?.response?.data === 'object'
      ? JSON.stringify(err.response.data)
      : typeof err?.cause === 'object'
      ? JSON.stringify(err.cause)
      : '';

    const isInsufficientScope =
      status === 403 &&
      (message.includes('insufficient') ||
        message.includes('scope') ||
        details.includes('insufficient_scope') ||
        details.includes('insufficient authentication scopes') ||
        details.includes('PERMISSION_DENIED') ||
        details.includes('Request had insufficient authentication scopes'));

    if (isInsufficientScope) {
      return new Error(
        'Google Drive permission needs to be renewed. Please disconnect and reconnect Google Drive to grant the required permissions.'
      );
    }

    const isAuthExpired =
      status === 401 ||
      message.includes('invalid_grant') ||
      message.includes('Token has been expired') ||
      details.includes('invalid_grant');

    if (isAuthExpired) {
      return new Error(
        'Google Drive authorization has expired. Please reconnect your Google Drive account.'
      );
    }

    if (status === 404) {
      return new Error('Google Drive file or folder was not found.');
    }

    return new Error(err?.response?.data?.error?.message || err?.message || 'Google Drive operation failed.');
  }

  /**
   * Instantiates an OAuth2 client for Google Drive operations.
   */
  public createOAuth2Client(oauthAccount?: OAuthCredentials | null, customRedirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const redirectUri =
      customRedirectUri ||
      process.env.GOOGLE_REDIRECT_URI?.trim() ||
      'http://localhost:5000/api/auth/google-drive/callback';

    if (!clientId || !clientSecret) {
      throw new Error(
        'Google Drive OAuth is not configured. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.'
      );
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    if (oauthAccount) {
      oauth2Client.setCredentials({
        access_token: oauthAccount.accessToken,
        refresh_token: oauthAccount.refreshToken || undefined,
        expiry_date: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined
      });
    }

    return oauth2Client;
  }

  /**
   * Generates the Google OAuth authorization URL for mentors with required drive.file scope.
   */
  public generateAuthUrl(state: string, redirectUri?: string): string {
    const oauth2Client = this.createOAuth2Client(null, redirectUri);

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: REQUIRED_DRIVE_SCOPES,
      include_granted_scopes: false,
      state
    });
  }

  /**
   * Exchanges authorization code for OAuth access & refresh tokens.
   */
  public async getTokensFromCode(code: string, redirectUri?: string): Promise<{
    tokens: any;
    email: string;
  }> {
    try {
      const oauth2Client = this.createOAuth2Client(null, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      let email = '';
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        email = userInfo.data.email || '';
      } catch {
        try {
          const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token!);
          email = tokenInfo.email || '';
        } catch {
          email = 'mentor@google.com';
        }
      }

      return { tokens, email };
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }

  private formatFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Finds or creates a subfolder in Google Drive.
   */
  private async getOrCreateSubfolder(
    driveClient: drive_v3.Drive,
    folderName: string,
    parentFolderId?: string
  ): Promise<string> {
    const cacheKey = `${parentFolderId || 'root'}:${folderName}`;
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    // Query for existing folder
    const escapedName = folderName.replace(/'/g, "\\'");
    let query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    try {
      const res = await driveClient.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (res.data.files && res.data.files.length > 0) {
        const folderId = res.data.files[0].id!;
        this.folderCache.set(cacheKey, folderId);
        return folderId;
      }
    } catch (searchErr: any) {
      const formatted = this.formatDriveError(searchErr);
      if (
        formatted.message.includes('permission needs to be renewed') ||
        formatted.message.includes('authorization has expired')
      ) {
        throw formatted;
      }
      console.warn(`Folder search for "${folderName}" failed, will attempt creation:`, searchErr?.message || searchErr);
    }

    // Create folder if not found
    try {
      const createRes = await driveClient.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentFolderId ? [parentFolderId] : undefined
        },
        fields: 'id, name'
      });

      const newFolderId = createRes.data.id!;
      this.folderCache.set(cacheKey, newFolderId);
      return newFolderId;
    } catch (createErr: any) {
      throw this.formatDriveError(createErr);
    }
  }

  /**
   * Resolves target folder structure in mentor's Drive:
   * E-Learning Platform/ -> Resources/ or Notes/ or Temporary Uploads/ -> [CategoryName]/
   */
  public async resolveTargetFolder(
    driveClient: drive_v3.Drive,
    categoryName?: string,
    fileType: FileCategoryType = 'resource'
  ): Promise<string | undefined> {
    try {
      // 1. Root Platform Folder in Mentor's Drive
      const rootFolderId = await this.getOrCreateSubfolder(driveClient, 'E-Learning Platform');

      // 2. Type Folder (Resources, Notes, or Temporary Uploads)
      const typeFolderName =
        fileType === 'note' ? 'Notes' : fileType === 'submission' ? 'Temporary Uploads' : 'Resources';
      const typeFolderId = await this.getOrCreateSubfolder(driveClient, typeFolderName, rootFolderId);

      // 3. Category Folder if specified
      if (categoryName && categoryName.trim()) {
        const categoryFolderId = await this.getOrCreateSubfolder(driveClient, categoryName.trim(), typeFolderId);
        return categoryFolderId;
      }

      return typeFolderId;
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }

  /**
   * Creates a direct resumable upload session on Google Drive using mentor's OAuth connection.
   */
  public async createUploadSession(params: CreateUploadSessionParams): Promise<UploadSessionResult> {
    const { fileName, fileSize, mimeType, categoryName, fileType = 'resource', userEmail, lessonId, oauthAccount } =
      params;

    if (!oauthAccount || (!oauthAccount.accessToken && !oauthAccount.refreshToken)) {
      throw new Error('Google Drive is not connected. Please connect your Google Drive account in the Mentor Dashboard.');
    }

    if (oauthAccount.scope && !this.isScopeValid(oauthAccount.scope)) {
      throw new Error(
        'Google Drive permission needs to be renewed. Please disconnect and reconnect Google Drive to grant the required permissions.'
      );
    }

    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      // Refresh token if needed
      let accessToken: string | null | undefined = null;
      try {
        const tokenRes = await oauth2Client.getAccessToken();
        accessToken = typeof tokenRes === 'string' ? tokenRes : tokenRes?.token;
      } catch (tokenErr: any) {
        throw this.formatDriveError(tokenErr);
      }

      if (!accessToken) {
        throw new Error('Google Drive authorization has expired. Please reconnect your Google Drive account.');
      }

      const targetFolderId = await this.resolveTargetFolder(driveClient, categoryName, fileType);

      const metadata: Record<string, any> = {
        name: fileName,
        description: `Uploaded by ${userEmail || 'mentor'} for lesson ${lessonId || 'N/A'}`
      };

      if (targetFolderId) {
        metadata.parents = [targetFolderId];
      }

      const clientOrigin = params.clientOrigin || 'http://localhost:5173';
      const uploadHeaders: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        'X-Upload-Content-Length': fileSize.toString()
      };
      if (clientOrigin) {
        uploadHeaders['Origin'] = clientOrigin;
      }

      // Call Google Drive Resumable Upload Initiation endpoint with CORS origin
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        metadata,
        {
          headers: uploadHeaders,
          maxRedirects: 0,
          validateStatus: (status) => status === 200 || status === 201
        }
      );

      const uploadUrl = response.headers['location'];
      if (!uploadUrl) {
        throw new Error('Google Drive did not return a resumable upload session URL.');
      }

      return {
        provider: 'google_drive',
        uploadUrl,
        targetFolderId
      };
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }

  /**
   * Verifies that the uploaded file exists on Google Drive.
   */
  public async verifyAndCompleteUpload(params: CompleteUploadParams): Promise<FileMetadataResult> {
    const { fileId, oauthAccount } = params;
    if (!fileId) {
      throw new Error('Google Drive file ID is required to complete upload.');
    }

    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      const fileRes = await driveClient.files.get({
        fileId,
        fields: 'id, name, size, mimeType, webContentLink, webViewLink, trashed, createdTime'
      });

      const file = fileRes.data;
      if (!file || file.trashed) {
        throw new Error('Uploaded file was not found in Google Drive.');
      }

      const bytes = file.size ? parseInt(file.size, 10) : 0;
      const sizeStr = params.fileSize
        ? typeof params.fileSize === 'string'
          ? params.fileSize
          : this.formatFileSize(params.fileSize)
        : this.formatFileSize(bytes);

      return {
        id: file.id!,
        name: file.name || params.fileName || 'file',
        size: sizeStr,
        sizeBytes: bytes,
        mimeType: file.mimeType || params.mimeType || 'application/octet-stream',
        webContentLink: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        downloadUrl: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
        provider: 'google_drive',
        createdAt: file.createdTime || new Date().toISOString()
      };
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }

  /**
   * Retrieves a readable stream of file bytes from Google Drive using server-side OAuth credentials.
   * This streams file data directly to the student without requiring student Google authentication or memory buffering.
   */
  public async getDownloadStream(
    fileId: string,
    oauthAccount?: OAuthCredentials | null
  ): Promise<Readable> {
    if (!oauthAccount || (!oauthAccount.accessToken && !oauthAccount.refreshToken)) {
      throw new Error('Google Drive account is not connected.');
    }

    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return response.data as Readable;
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }

  /**
   * Returns direct download URL for authorized student download.
   */
  public async getDownloadUrl(
    fileId: string,
    _fileName?: string,
    oauthAccount?: OAuthCredentials | null
  ): Promise<string> {
    if (oauthAccount && (oauthAccount.accessToken || oauthAccount.refreshToken)) {
      try {
        const oauth2Client = this.createOAuth2Client(oauthAccount);
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

        const fileRes = await driveClient.files.get({
          fileId,
          fields: 'id, name, webContentLink, webViewLink, trashed'
        });

        if (fileRes.data?.webContentLink) {
          return fileRes.data.webContentLink;
        }
        if (fileRes.data?.webViewLink) {
          return fileRes.data.webViewLink;
        }
      } catch {
        // Fallback to direct export URL
      }
    }

    return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  }

  /**
   * Deletes a file from Google Drive.
   */
  public async deleteFile(fileId: string, oauthAccount?: OAuthCredentials | null): Promise<boolean> {
    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      await driveClient.files.delete({ fileId });
      return true;
    } catch (err: any) {
      if (err.code === 404 || err.status === 404) return true;
      console.warn(`Failed to delete Google Drive file ${fileId}:`, err.message);
      return false;
    }
  }

  /**
   * Fetches metadata for a file in Google Drive.
   */
  public async getFileMetadata(
    fileId: string,
    oauthAccount?: OAuthCredentials | null
  ): Promise<FileMetadataResult | null> {
    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      const res = await driveClient.files.get({
        fileId,
        fields: 'id, name, size, mimeType, webContentLink, webViewLink, trashed, createdTime'
      });

      if (!res.data || res.data.trashed) return null;

      const bytes = res.data.size ? parseInt(res.data.size, 10) : 0;
      return {
        id: res.data.id!,
        name: res.data.name || 'file',
        size: this.formatFileSize(bytes),
        sizeBytes: bytes,
        mimeType: res.data.mimeType || 'application/octet-stream',
        webContentLink: res.data.webContentLink || undefined,
        webViewLink: res.data.webViewLink || undefined,
        downloadUrl: res.data.webContentLink || `https://drive.google.com/uc?export=download&id=${res.data.id}`,
        provider: 'google_drive',
        createdAt: res.data.createdTime || undefined
      };
    } catch {
      return null;
    }
  }

  /**
   * Uploads buffer directly to Google Drive using mentor's OAuth client.
   */
  public async uploadBufferDirect(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    categoryName?: string,
    fileType: FileCategoryType = 'resource',
    oauthAccount?: OAuthCredentials | null
  ): Promise<FileMetadataResult> {
    try {
      const oauth2Client = this.createOAuth2Client(oauthAccount);
      const driveClient = google.drive({ version: 'v3', auth: oauth2Client });

      const targetFolderId = await this.resolveTargetFolder(driveClient, categoryName, fileType);

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const res = await driveClient.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType || 'application/octet-stream',
          parents: targetFolderId ? [targetFolderId] : undefined
        },
        media: {
          mimeType: mimeType || 'application/octet-stream',
          body: stream
        },
        fields: 'id, name, size, mimeType, webContentLink, webViewLink, createdTime'
      });

      const file = res.data;
      const bytes = buffer.length;
      return {
        id: file.id!,
        name: file.name || fileName,
        size: this.formatFileSize(bytes),
        sizeBytes: bytes,
        mimeType: file.mimeType || mimeType,
        webContentLink: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        downloadUrl: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
        provider: 'google_drive',
        createdAt: file.createdTime || new Date().toISOString()
      };
    } catch (err: any) {
      throw this.formatDriveError(err);
    }
  }
}
