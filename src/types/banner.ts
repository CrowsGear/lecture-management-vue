export interface IBanner {
  id?: number;
  position: 'top' | 'bottom';
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface IPreSignedUrl {
  url: string;
  fields: Record<string, string>;
} 