export interface SessionPayload {
  sub: string;       // User UUID
  tenantid: string;  // printxpert, passaporte, etc.
  name: string;
  exp: number;
}