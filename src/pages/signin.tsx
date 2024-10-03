import React, { useState, FormEvent } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import Input from "@/components/shared/Input"
import Button from "@/components/shared/Button"
import { toast } from "react-toastify"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]"
import Link from "next/link"
import { getTwoFactorValid } from "@/utils/validation"
import axios, { isAxiosError } from "axios"
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [submit, setSubmit] = useState<boolean>(false)
  const [googleSignin, setSignin] = useState<boolean>(false)
  const router = useRouter()

  async function handleSignin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = {
      redirect: false,
      email: event.currentTarget.email.value,
      password: event.currentTarget.password.value,
    }
    // Check email and password empty value
    if (!data.email || !data.password) {
      toast.warning('Input email or password.')
      return;
    }
    setSubmit(true);

    try {
      const signResponse = await signIn('credentials', data);
      if (!signResponse?.ok) {
        toast.warning('Your email or password is invalid.')
        // Submit end
        setSubmit(false);
      } else {
        const twofactorStatus = await axios.post('/api/two-factor/status', { email: data.email });
        const url = twofactorStatus.data.success ? '/validate_2fa' : '/';
        router.push(url)
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
      // Submit end
      setSubmit(false)
    }
  }

  const handleSigninGoogle = async () => {
    signIn('google');
    setSignin(true)
  }

  return (
    <>
      <Layout>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSignin}>
              <div>
                <div className="mt-2">
                  <Input type="email" name="email" placeholder="Email address" />
                </div>
              </div>

              <div>
                <div className="mt-2">
                  <Input type="password" name="password" placeholder="Password" />
                  <div className="text-sm flex justify-end mt-2">
                    <Link href="/reset-password" className="font-semibold text-blue	hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={submit}>
                <p className="w-full">Sign in</p>
              </Button>
            </form>

            <div className="flex-100 my-8 flex items-center">
              <hr className="border-gray-light dark:border-gray-lightest flex-auto border-t-2" />
              <span className="text-gray-light dark:text-gray-lightest px-4 font-sans font-light"> OR </span>
              <hr className="border-gray-light dark:border-gray-lightest flex-auto border-t-2" />
            </div>

            <Button type="submit" disabled={googleSignin} onClick={handleSigninGoogle}>
              <div className="w-full flex justify-center">
                <FcGoogle size="30px" />
                <p className="mx-2">Sign in with Google</p>
              </div>
            </Button>

            <p className="mt-10 text-center text-sm text-gray-500">
              Not a member?{' '}
              <Link href="/signup" className="font-semibold leading-6 text-blue">
                Sign up now!
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const validation = await getTwoFactorValid(session?.user?.email);

  if (session && validation) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session: session
    },
  }
}