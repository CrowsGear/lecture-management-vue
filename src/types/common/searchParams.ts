export interface ISearchParams {
    /* 키워드 검색 */
    searchKeyword?: string;
    searchField?: string;
    searchType?: string;
    
    /* 기간 검색 */
    startDate?: string;
    endDate?: string;
    
    /* 페이지네이션 */
    page?: number;
    limit?: number;
    
    /* 삭제 여부 */
    isDeleted?: boolean;
}
