// types/auth.ts
export interface ILoginForm {
    phone: string;
    password: string;
}

export interface ILoginResponse {
    code: string;
    message: string;
    data?: {
        accessToken: string;
        authType: IAuthType;
    }
}

/**
 * 권한 타입
 * 0: 선생님
 * 1: 학생
 * 2: 학부모
 */
export type IAuthType = 0 | 1 | 2;
