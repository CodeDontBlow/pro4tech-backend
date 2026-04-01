export class ResponsePaginationDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit,
    };
  }
}