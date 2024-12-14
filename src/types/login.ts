// types/auth.ts
export interface ILoginForm {
    phone: string;
    password: string;
}

export interface ILoginResponse {
    success: boolean;
    message: string;
    token?: string;
}
