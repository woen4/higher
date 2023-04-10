import { HttpStatus } from "./httpStatus";

export class HigherResponse {
  status: HttpStatus | number;
  payload: any;
  headers: Record<string, string | number>;

  constructor(
    status: HttpStatus | number,
    payload?: any,
    headers?: Record<string, string | number>
  ) {
    this.status = status;
    this.payload = payload;
    this.headers = headers;
  }
}

export const HigherResponseBuilder = (
  status: HttpStatus | number,
  payload?: any,
  headers?: Record<string, string | number>
) => new HigherResponse(status, payload, headers || {});
