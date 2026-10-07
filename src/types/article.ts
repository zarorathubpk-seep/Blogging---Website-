export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  readingTime: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  isPublished: boolean;
  order: number;
  imageUrl?: string;
}
