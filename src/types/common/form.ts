/* 폼 필드 for Modal */
export interface IFormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: {
    label: string;
    value: string | number;
  }[];
}

/* 폼 설정 for Modal */
export interface IFormConfig {
  title: string;
  fields: IFormField[];
  submitText?: string;
  cancelText?: string;
} 