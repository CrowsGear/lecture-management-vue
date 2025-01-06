import type { ISmsFormPlaceholder } from "../types/constant";

/* Constants */
export const SMS_FORM_PLACEHOLDER_REGEX = /\$\$[^$]+\$\$/g;

/**
 * SMS 양식의 치환자 유효성을 검사하는 함수
 * @param smsForm - 검사할 SMS 양식 문자열
 * @param placeholders - 유효한 치환자 목록
 * @throws {Error} 유효하지 않은 치환자가 있을 경우 에러를 발생시킴
 */
export const validateSmsFormPlaceholders = (smsForm: string, placeholders: ISmsFormPlaceholder[]): void => {
  // SMS 양식에서 사용된 치환자 추출
  const usedPlaceholders = smsForm.match(SMS_FORM_PLACEHOLDER_REGEX) || [];
  
  // 사용된 치환자들이 유효한지 검증
  const invalidPlaceholders = usedPlaceholders.filter(used => {
    return !placeholders.some(p => p.value === used);
  });

  if (invalidPlaceholders.length > 0) {
    throw new Error(`유효하지 않은 치환자가 있습니다: ${invalidPlaceholders.join(", ")}`);
  }
}; 