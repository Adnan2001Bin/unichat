// // next-auth.d.ts
// import { DefaultSession, DefaultUser } from "next-auth";
// import { DefaultJWT } from "next-auth/jwt";

// declare module "next-auth" {
//   interface User extends DefaultUser {
//     role?: "undergraduate" | "graduate" | "admin";
//     id: string;
//   }

//   interface Session {
//     user?: {
//       id?: string;
//       role?: "undergraduate" | "graduate" | "admin";
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT extends DefaultJWT {
//     role?: "undergraduate" | "graduate" | "admin";
//     sub?: string;
//   }
// }