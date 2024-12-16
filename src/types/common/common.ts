/* DataTable.vue 내의 테이블 정보 */
export interface ITableInfo {
    tableName: string;
    tableComment: string;
    columns: IColumnInfo[];
}

/* 테이블 컬럼 정보 */
export interface IColumnInfo {
    name: string;
    comment: string;
    type?: string;
}

/* SearchForm.vue 내의 검색 파라미터 정보 */
export interface ISearchField {
  name: string;          // 필드 이름
  label: string;         // 화면에 표시될 라벨
  type: 'text' | 'date' | 'select' | 'period';  // 입력 타입
  placeholder?: string;  // placeholder 텍스트
  options?: {           // select 타입일 경우의 옵션들
    label: string;
    value: string | number;
  }[];
}

/* SearchForm.vue 내의 검색 옵션 정보 */
export interface ISearchConfig {
  fields: ISearchField[];
  periods?: {           // 기간 선택 옵션
    label: string;
    value: string;
  }[];
}

/* SearchForm.vue 내의 검색 파라미터 정보 */
export interface ISearchParams {
  [key: string]: any;
}

/* ReadOnlyTable.vue 내의 테이블 헤더 정보 */
export interface ITableHeader {
  key: string;
  label: string;
  width?: string;
}

/* ReadOnlyTable.vue 내의 테이블 프롭스 정보 */
export interface IReadOnlyTableProps {
  headers: ITableHeader[];
  items: any[];
  totalCount?: number;
  keyField?: string;
}