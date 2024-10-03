import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import type { Account, NextAuthOptions } from 'next-auth'
import connectToDatabase from "@/lib/clientDB";
import { Collections, IAccount, IUser, LoginType, Status } from "@/constants/database";
import bcrypt from 'bcrypt';
import { Profile } from "next-auth/core/types";
import { updateTwofactorStatus } from "@/utils/validation";
interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const { email, password } = credentials as Credentials

          // Get user collection
          const { client, db } = await connectToDatabase();
          const collection = db.collection<IUser>(Collections.User);
          const user = await collection.findOne({ email: email });

          if (!user) {
            client.close();
            throw new Error('No user found!');
          } else if (user.status !== Status.ACTIVE && user.status !== Status.EXPIRED) {
            client.close();
            throw new Error('User account is not available!');
          } else if (user.loginType !== LoginType.CREDENTIAL) {
            client.close();
            throw new Error('Please try another option.');
          }

          const isValid = await bcrypt.compare(password, user?.password as string)
          if (!isValid) {
            client.close();
            throw new Error('Could not log you in!');
          }

          client.close();
          return {
            id: user?._id.toString() as string,
            name: user?.username as string,
            email: email
          };

        } catch (error) {
          console.log(error);
          return null;
        }
      },
    })
  ],
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SCRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 Day
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account?.provider === "google") {
        try {
          const profileInfo = profile as Profile;

          // Get user collection
          const { client, db } = await connectToDatabase();
          // Check user with email
          const collection = db.collection<IUser>(Collections.User);
          const user = await collection.findOne({ email: profileInfo.email });

          if (user && user?.loginType !== account?.provider) return false

          const accountCollection = db.collection<IAccount>(Collections.Account);
          const accountInfo = await accountCollection.findOne({ providerAccountId: account.providerAccountId });
          if (!accountInfo) {
            const timeAt = new Date().toISOString();
            const userCollection = db.collection(Collections.User);
            const newUser = await userCollection.insertOne({
              fullname: `${profileInfo.family_name} ${profileInfo.given_name}`,
              email: profileInfo.email,
              image: profileInfo.picture,
              emailVerified: profileInfo.email_verified,
              username: profileInfo.name,
              status: Status.NEW,
              loginType: account?.provider,
              createdAt: timeAt,
              updatedAt: timeAt,
            })

            await accountCollection.insertOne({
              userId: newUser.insertedId.toString(),
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token as string,
              expires_at: account.expires_at as number,
              scope: account.scope as string,
              token_type: account.token_type as string,
              id_token: account.id_token as string
            })
          }

          if (!user) {
            const timeAt = new Date().toISOString();
            const userCollection = db.collection(Collections.User);
            const newUser = await userCollection.insertOne({
              fullname: `${profileInfo.family_name} ${profileInfo.given_name}`,
              email: profileInfo.email,
              image: profileInfo.picture,
              emailVerified: profileInfo.email_verified,
              username: profileInfo.name,
              status: Status.NEW,
              loginType: account?.provider,
              createdAt: timeAt,
              updatedAt: timeAt,
            })

            await accountCollection.updateOne(
              { providerAccountId: account.providerAccountId },
              { $set: { userId: newUser.insertedId.toString() } }
            )
          }

          client.close();
          return profileInfo.email_verified ? true : false;
        } catch (err) {
          console.log("Google Signin Debug: ", err)
          return false
        }
      }

      return true
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.image = null
      }
      return session
    },
  },
  events: {
    async signOut(message) {
      const { token } = message
      const email = token.email as string;
      await updateTwofactorStatus(email);
    },
  }
}

export default NextAuth(authOptions)