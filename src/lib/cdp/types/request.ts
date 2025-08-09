export interface CdpRequest {
  requestMethod: "GET" | "POST";
  requestHost: string;
  requestPath: string;
}
