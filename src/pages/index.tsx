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
import classNames from "classnames";

export default function SignIn() {
  const [submit, setSubmit] = useState<boolean>(false)
  const [googleSignin, setSignin] = useState<boolean>(false)
  const [newAvailble, setNewAvailable] = useState<boolean>(false)
  const [loginAvailable, setLoginAvailable] = useState<boolean>(false)
  const router = useRouter()

  const handleEmailSignin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = event.currentTarget.email.value
    const confirmCode = event.currentTarget.confirm_code?.value
    const password = event.currentTarget.password?.value

    setSubmit(true);
    const data = { redirect: false, email }
    try {
      let signin = true;
      if (!newAvailble) {
        const { data: checkUser } = await axios.post('/api/profile/profile-info', { email });
        if (!checkUser.info) {
          if (checkUser?.message) {
            toast.warning(checkUser?.message)
            // Submit end
            setSubmit(false)
            return;
          } else {
            signin = false;
            setNewAvailable(true)
          }
        }
      }

      if (confirmCode) {
        // Code confirm
        const data = { email, confirmCode }
        const { data: code } = await axios.post('/api/auth/confirm', { data });
        if (code.confirm) {
          window.location.href = '/onboarding'
          return;
        }
      }

      if (!confirmCode && signin) {
        setLoginAvailable(true)

        if (password) {
          const loginData = {
            redirect: false,
            email,
            password
          }
          const signResponse = await signIn('credentials', loginData);

          if (!signResponse?.ok) {
            toast.warning('Your email or password is invalid.')
            // Submit end
            setSubmit(false);
          } else {
            const twofactorStatus = await axios.post('/api/two-factor/status', { email: data.email });
            const url = twofactorStatus.data.success ? '/validate_2fa' : '/home';
            router.push(url)
          }
        }
      }
      setSubmit(false)
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
    await signIn('google');
    setSignin(true)
  }

  return (
    <>
      <div
        className={classNames(
          "overflow-hidden min-h-screen md:h-screen flex flex-col justify-center"
        )}
      >
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Welcome to the Forfiles Dashboard
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <Button type="submit" disabled={googleSignin} onClick={handleSigninGoogle}>
              <div className="w-full flex justify-center">
                <FcGoogle size="30px" />
                <p className="mx-2">Login/Register with Google</p>
              </div>
            </Button>

            <div className="flex-100 my-8 flex items-center">
              <hr className="border-gray-light dark:border-gray-lightest flex-auto border-t-2" />
              <span className="text-gray-light dark:text-gray-lightest px-4 font-sans font-light"> OR </span>
              <hr className="border-gray-light dark:border-gray-lightest flex-auto border-t-2" />
            </div>

            <form className="space-y-6" onSubmit={handleEmailSignin}>
              <div>
                <div className="mt-2">
                  <Input type="email" name="email" placeholder="Email address" />
                </div>
              </div>

              {
                loginAvailable &&
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
              }

              {
                newAvailble &&
                <>
                  <p>There is no existing account under this email address. We just sent you a temporary sign up code. Please check your inbox.</p>
                  <div>
                    <Input type="text" name="confirm_code" placeholder="Please login code" />
                  </div>
                </>
              }

              <Button type="submit" disabled={submit}>
                {
                  newAvailble ? <p className="w-full">Create new account</p> :
                    loginAvailable ? <p className="w-full">Signin</p> :
                      <p className="w-full">Login/Register with Email</p>
                }

              </Button>
            </form>

            {/* <p className="mt-10 text-center text-sm text-gray-500">
              Not a member?{' '}
              <Link href="/signup" className="font-semibold leading-6 text-blue">
                Sign up now!
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const validation = await getTwoFactorValid(session?.user?.email);

  if (session && validation) {
    return {
      redirect: {
        destination: '/home',
        permanent: false,
      },
    }
  }

  if (session && !validation) {
    return {
      redirect: {
        destination: '/validate_2fa',
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