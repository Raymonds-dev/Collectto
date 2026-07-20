export type UploadContext = 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND' | 'COLLECTION' | 'ITEM';

export interface FileInput {
  fileName: string;
  contentType: string;
}

export interface GenerateUploadUrlsRequest {
  context: UploadContext;
  resourceId?: string;
  parentId?: string;
  files: FileInput[];
}

export interface FileOutput {
  filePath: string;
  uploadUrl: string;
}

export interface GenerateUploadUrlsResponse {
  resourceId: string;
  files: FileOutput[];
}
