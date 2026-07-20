export type UploadContext = 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND' | 'COLLECTION' | 'ITEM';

export interface UploadFileInput {
  fileName: string;
  contentType: string;
}

export interface GenerateUploadUrlsRequest {
  resourceId: string;
  parentId?: string;
  context: UploadContext;
  files: UploadFileInput[];
}

export interface GenerateUploadUrlResponseItem {
  filePath: string;
  uploadUrl: string;
}

export type GenerateUploadUrlsResponse = GenerateUploadUrlResponseItem[];
