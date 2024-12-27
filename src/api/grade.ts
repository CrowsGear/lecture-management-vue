import axios from "../utils/axios";
import type { IGradeUploadParams } from "../types/grade";
import type { IResponse } from "../types/common/response";
import type { IGradeSearchParams } from "../types/grade";

export const validateGradeImage = async (params: IGradeUploadParams): Promise<IResponse> => {
  const response = await axios.post("/grades/check", params);
  return response.data;
};

/**
 * 성적 이미지 업로드 프로세스
 * @param file - 업로드할 파일
 * @param params - 업로드 파라미터
 */
export const uploadGradeImage = async (
  file: File, 
  params: IGradeUploadParams
): Promise<IResponse> => {
  let preSignedUrl: string | null = null;
  let uploadedFileUrl: string | null = null;

  console.log("uploadGradeImage", file, params);

  try {
    // 1. Pre-signed URL 발급
    const preSignedResponse = await getPreSignedUrl(params);
    preSignedUrl = preSignedResponse.data.signedUrl;

    // 2. S3 업로드
    uploadedFileUrl = await uploadToS3(file, preSignedResponse);

    // 3. DB 저장
    const apiResponse = await createGrade(params);
    console.log("uploadGradeImage apiResponse", apiResponse);
    return apiResponse;
  } catch (error) {
    // Pre-signed URL 발급 실패
    if (!preSignedUrl) {
      throw new Error(`Pre-signed URL 발급 실패: ${file.name}`);
    }

    // S3 업로드 실패
    if (preSignedUrl && !uploadedFileUrl) {
      throw new Error(`S3 업로드 실패: ${file.name}`);
    }

    // DB 저장 실패
    if (uploadedFileUrl) {
      throw new Error(`DB 저장 실패: ${file.name}`);
    }

    throw error;
  }
};

/**
 * Pre-signed URL 요청
 * @param params - 성적 이미지 업로드 요청 파라미터
 * @see IGradeUploadParams
 */
const getPreSignedUrl = async (params: IGradeUploadParams): Promise<IResponse> => {
  const response = await axios.post("/grades/pre-signed-url", params);
  return response.data;
};

/**
 * S3 업로드
 * @param file - 업로드할 파일
 * @param response - Pre-signed URL 데이터
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
 * @param gradeData - 성적 이미지 정보
 */
const createGrade = async (params: IGradeUploadParams): Promise<IResponse> => {
  const response = await axios.post("/grades", params);
  return response.data;
};

/**
 * 성적 목록 조회
 */
export const fetchGrades = async (params?: IGradeSearchParams): Promise<IResponse> => {
  const response = await axios.get("/grades", { params });
  return response.data;
};

/**
 * 성적 삭제
 */
export const deleteGrade = async (id: number): Promise<IResponse> => {
  console.log("deleteGrade", id);
  const response = await axios.delete(`/grades/${id}`);
  console.log("deleteGrade response", response);
  return response.data;
};