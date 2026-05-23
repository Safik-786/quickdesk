export interface JwtUser {
  id: string;
  email: string;
}

export interface RequestWithUser {
  user?: JwtUser;
}
