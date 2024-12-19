export interface IGradeImage {
  fileName: string;
  rawDateTime: string;
  gradeImageUrl: string;
  studentCode: string;
  examDateTime: string;
  lectureCode: string;
}

export interface IPreSignedUrl {
  signedUrl: string;
}

export interface IGradePreview extends IGradeImage {
  previewUrl: string;
}

export interface IGradeUploadParams {
  lecture: {
    lectureCode: string;
    student: {
      studentCode: string;
      grade: {
        gradeImageUrl: string;
      };
    };
    lectureSession: {
      sessionDate: string;
    };
  };
} 