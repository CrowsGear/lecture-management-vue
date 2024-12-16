export interface IGradeImage {
  fileName: string;
  url: string;
  studentCode: string;
  examDate: string;
  subjectCode: string;
  score?: number;
}

export interface IPreSignedUrl {
  url: string;
  fields: Record<string, string>;
} 