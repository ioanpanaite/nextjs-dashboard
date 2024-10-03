import PageHead from "@/components/layout/Pagehead";
import Layout from '@/components/layout/Layout';
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next"
import Personal from "@/components/grid/Personal";
import ChangePassword from "@/components/grid/ChangePassword";
import DeleteAccount from "@/components/grid/DeleteAccount";
import TwoFactorApp from "@/components/grid/TwoFactorApp";
import { getPasswordStatus, getStatusUser, getTwoFactorValid } from "@/utils/validation";
import Prices from "@/components/grid/Prices";
import { getPaymentInfo } from "@/utils/payment";

export default function Profile({ passStatus, email, prices }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <PageHead />
      <Layout>
        <div className="md:w-7/12 w-10/12 m-auto mt-10">
          <Personal person={email} />
          {passStatus && <ChangePassword />}
          <TwoFactorApp />
          <Prices person={email} prices={prices} />
          <DeleteAccount />
        </div>
      </Layout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const validation = await getTwoFactorValid(session?.user?.email);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  } else if (!validation) {
    return {
      redirect: {
        destination: '/validate_2fa',
        permanent: false,
      },
    }
  }
  
  const userNewStatus = await getStatusUser(session?.user?.email)
  if (userNewStatus) {
    return {
      redirect: {
        destination: '/onboarding',
        permanent: false,
      },
    }
  }

  // Get password status
  const passStatus = await getPasswordStatus(session.user?.email);
  const payment = await getPaymentInfo();

  return {
    props: {
      passStatus: passStatus,
      email: session.user?.email,
      prices: payment.prices
    },
  }
}