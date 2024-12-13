export interface ITableInfo {
    tableName: string;
    tableComment: string;
    columns: IColumnInfo[];
}

export interface IColumnInfo {
    name: string;
    comment: string;
    type?: string;
}
