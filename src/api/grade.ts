import axiosInstance from "../utils/axios";
import type { IGradeUploadParams } from "../types/grade";
import type { IResponse } from "../types/common/response";
import type { IGradeSearchParams } from "../types/grade";


/**
 * 성적 이미지 검증
 * @description 학생, 강의, 학생-강의 매핑 유효성 검증
 */
export const validateGradeImage = async (params: Partial<IGradeUploadParams>): Promise<IResponse> => {
  const response = await axiosInstance.post("/grades/check", params);
  return response.data;
};

/**
 * SMS 폼 조회
 * @description 이미지명을 통한 SMS 폼 조회
 */
export const getSmsForm = async (params: Partial<IGradeUploadParams>): Promise<IResponse> => {
  const response = await axiosInstance.post("/grades/sms-form-check", params);
  return response.data;
};

/**
 * 성적 이미지 업로드 프로세스
 * @description 전체 업로드 프로세스 조율
 * @see getPreSignedUrl
 * @see uploadToS3
 * @see createGrade
 */
export const uploadGradeImage = async (
  file: File, 
  params: IGradeUploadParams
): Promise<IResponse> => {
  let preSignedUrl: string | null = null;
  let uploadedFileUrl: string | null = null;

  try {
    const preSignedResponse = await getPreSignedUrl(params);
    preSignedUrl = preSignedResponse.data.signedUrl;

    uploadedFileUrl = await uploadToS3(file, preSignedResponse);

    const apiResponse = await createGrade(params);
    return apiResponse;
  } catch (error) {
    if (!preSignedUrl) {
      throw new Error(`Pre-signed URL 발급 실패: ${file.name}`);
    }
    if (preSignedUrl && !uploadedFileUrl) {
      throw new Error(`S3 업로드 실패: ${file.name}`);
    }
    if (uploadedFileUrl) {
      throw new Error(`DB 저장 실패: ${file.name}`);
    }
    throw error;
  }
};

/**
 * Pre-signed URL 요청
 * @memberof uploadGradeImage
 */
const getPreSignedUrl = async (params: IGradeUploadParams): Promise<IResponse> => {
  const response = await axiosInstance.post("/grades/pre-signed-url", params);
  return response.data;
};

/**
 * S3 업로드
 * @memberof uploadGradeImage
 */
const uploadToS3 = async (file: File, response: IResponse): Promise<string> => {
  const preSignedData = response.data;
  const s3Response = await fetch(preSignedData.signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type // image/jpeg, image/png 등 이미지 MIME 타입 설정
    }
  });

  if (!s3Response.ok) throw new Error("S3 업로드 실패");
  return s3Response.url;
};

/**
 * 성적 이미지 정보 저장
 * @memberof uploadGradeImage
 */
const createGrade = async (params: IGradeUploadParams): Promise<IResponse> => {
  const response = await axiosInstance.post("/grades", params);
  return response.data;
};

/* CRUD APIs */
/**
 * 성적 목록 조회
 */
export const fetchGrades = async (params?: IGradeSearchParams): Promise<IResponse> => {
  const response = await axiosInstance.get("/grades", { params });
  return response.data;
};

/**
 * 성적 삭제
 */
export const deleteGrade = async (id: number): Promise<IResponse> => {
  const response = await axiosInstance.delete(`/grades/${id}`);
  return response.data;
};