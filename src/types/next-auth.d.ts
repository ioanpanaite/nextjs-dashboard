import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Profile {
    family_name: string;
    given_name: string;
    email: string;
    picture: string;
    email_verified: boolean;
    name: string;
  }
}