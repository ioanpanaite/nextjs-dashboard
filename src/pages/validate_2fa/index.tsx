import React, { useState, FormEvent, useEffect } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import { useRouter } from "next/router"
import Button from '@/components/shared/Button';
import Input from "@/components/shared/Input"
import axios, { isAxiosError } from "axios"
import { toast } from "react-toastify"
import Link from "next/link"
import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import qrcode2FA from '@/public/temp/twofactor.png'
import ReloadImage from "@/components/shared/ReloadImage"

type TwoFactor = {
  factorSid: string;
  challengeSid?: string;
  entityIdentity: string;
  status: string;
  qrcode: string;
}

export default function ValidateTwoFactor() {
  const router = useRouter()
  const [submit, setSubmit] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [twofactor, setTwofactor] = useState<TwoFactor>();
  const [load, setLoad] = useState<boolean>(false);
  const [isExpired, setExpired] = useState<boolean>(false); // Dev mode true
  const [resend, setResend] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    try {
      const getTwofactor = async () => {
        if (!load) {
          const response = await axios.post('/api/two-factor', { email: session?.user?.email });
          if (response?.data.success) {
            setTwofactor(response?.data.info);
          } else {
            toast.error(response?.data.message)
          }
          setLoad(true);
        }
      }
      getTwofactor();
    } catch (error) {
      console.log(error)
    }
  }, [load])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!code) {
      toast.warning("Please input Two-factor Code.")
      return;
    }

    // Set loading
    setSubmit(true)
    try {
      const data = {
        factorSid: twofactor?.factorSid,
        challengeSid: twofactor?.challengeSid, 
        entityIdentity: twofactor?.entityIdentity,
        code, 
        email: session?.user?.email
      }
      const response = await axios.post('/api/two-factor/verify', data);

      if (response?.data.success) router.replace('/home')
      else toast.error(response?.data.message)
      setSubmit(false)
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
      // Set expired status when two factor qrcode is expired
      setExpired(true)
      // End loading
      setSubmit(false)
    }
  }

  // Two factor validation checking
  const twofactorValid = () => {
    return twofactor?.status === 'unverified' ? true : false
  }

  // Handle when qrcode is expired
  const handleExpired = async () => {
    setResend(true)
    try {
      const response = await axios.post('/api/two-factor/new', { email: session?.user?.email });

      if (response?.data.success) {
        setTwofactor(response?.data.info);
      }
      else toast.error(response?.data.message)
      setResend(false)
      setExpired(false)
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
      // Set expired status when two factor qrcode is expired
      setExpired(true)
      // End loading
      setResend(false)
    }
  }

  return (
    <>
      <Layout>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Two-Factor Authentication
            </h2>
            {
              load ?
                (twofactorValid() ?
                  <div className="mt-5">
                    <p className="mt-5 text-center text-sm">
                      Please scan the QR code from your authenticator app.
                    </p>
                    <div className="mt-5 flex justify-center">
                      {!isExpired && twofactor?.qrcode ?
                        <Image alt="2fa" src={twofactor?.qrcode} width={200} height={200} /> :
                        <ReloadImage onClick={handleExpired} src={qrcode2FA} load={resend} alt="2fa" />
                      }
                    </div>
                  </div>
                  :
                  <p className="mt-5 text-center text-sm">
                    Your account is protected with two-factor authentication. Please enter the code from your authenticator app.

                    <div className="flex items-center justify-center" onClick={handleExpired}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                  </p>)
                : <></>
            }
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="mt-2">
                  <Input type="text" placeholder="Two-factor Code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
              </div>

              <Button type="submit" disabled={submit}>
                {!submit && <p className="w-full">Continue</p>}
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session
    }
  }
}
