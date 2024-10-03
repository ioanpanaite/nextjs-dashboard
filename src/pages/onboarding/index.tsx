'use client'
import React, { useState, FormEvent } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import { useRouter } from "next/router"
import Button from '@/components/shared/Button';
import Input from "@/components/shared/Input"
import axios, { isAxiosError } from "axios"
import { toast } from "react-toastify"
import Link from "next/link"
import type { GetServerSideProps, GetServerSidePropsContext, GetStaticProps, InferGetStaticPropsType } from "next"
import SelectList from "@/components/shared/SelectList"
import { countries } from "@/constants/countries"
import { currency, exchangeList } from "@/constants/coin"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import { EXPIRE_TIME } from "@/lib/utils"
import { getPasswordStatus, getStatusUser } from "@/utils/validation"

export default function Onboarding({ email, isCredential }: InferGetStaticPropsType<GetStaticProps>) {
  const router = useRouter()
  const [submit, setSubmit] = useState<boolean>(false);
  const [selectedCountry, setCountry] = useState(countries[225])
  const [selectedCrypto, setCrypto] = useState(currency[0])
  const [selectedExchange, setExchange] = useState(exchangeList[0])

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = {
      firstname: event.currentTarget.firstname.value,
      lastname: event.currentTarget.lastname.value,
      email: email,
      password: isCredential ? event.currentTarget.password.value : '',
      telegram_user: event.currentTarget.telegram_user.value,
    }
    // Check email and password empty value
    if (!formData.firstname) {
      toast.warning('Please input First Name.'); return;
    } else if (!formData.lastname) {
      toast.warning('Please input Last Name.'); return;
    } else if (isCredential && !formData.password) {
      toast.warning('Please input password.'); return;
    }
    // Set submit
    setSubmit(true)

    try {
      const data = {
        fullname: `${formData.firstname} ${formData.lastname}`,
        email,
        password: formData.password,
        country: selectedCountry.id,
        crypto: selectedCrypto.id,
        primary_exchange: selectedExchange.id,
        telegram_user: formData.telegram_user,
      }
      const { data: result } = await axios.post('/api/profile/update', data);
      if (result.success) router.replace(`/onboarding/final`)
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

  return (
    <>
      <Layout>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Welcome to our platform
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
            <form className="space-y-6" onSubmit={handleProfile}>
              <div className="mt-2">
                <Input type="text" name="firstname" placeholder="First Name" />
              </div>
              <div className="mt-2">
                <Input type="text" name="lastname" placeholder="Last Name" />
              </div>
              {isCredential &&
                <div className="mt-2">
                  <Input type="password" name="password" placeholder="Password" />
                </div>
              }

              <div className="grid gap-4 mb-4 sm:grid-cols-2">
                <div className="my-2 ">
                  <SelectList title="What country are you based in?" items={countries} selected={selectedCountry} setSelected={setCountry} />
                </div>
                <div className="mt-2">
                  <SelectList title="What crypto do you hold or trade with?" items={currency} selected={selectedCrypto} setSelected={setCrypto} />
                </div>
              </div>
              <div className="mt-2">
                <SelectList title="What crypto do you hold or trade with?" items={exchangeList} selected={selectedExchange} setSelected={setExchange} />
              </div>
              <div className="mt-2">
                <Input type="text" name="telegram_user" placeholder="Telegram Username? (Optional)" />
              </div>

              <Button type="submit" disabled={submit}>
                {!submit && <p className="w-full">Continue</p>}
              </Button>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Have an account already?{' '}
              <Link href="/" className="font-semibold leading-6 text-blue">
                Sign in
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
  const cookieStore = context.req.cookies
  const userNewStatus = await getStatusUser(session?.user?.email)
  const credentialUser = await getPasswordStatus(session?.user?.email)

  if (session && !userNewStatus) {
    return {
      redirect: {
        destination: '/home',
        permanent: false,
      },
    }
  }

  if (userNewStatus && !credentialUser) {
    // For google new user
    const userEmail = session?.user?.email as string
    return {
      props: {
        email: userEmail,
        isCredential: false
      }
    }
  }

  if (cookieStore) {
    try {
      const profile = cookieStore?.profile as string
      const decode = Buffer.from(profile, 'base64').toString('ascii')
      const { email, createdAt } = JSON.parse(decode)

      const now = (new Date()).getTime()
      const diffTime = now - Number(createdAt)
      if (diffTime > EXPIRE_TIME) {
        return {
          redirect: {
            destination: '/onboarding/expired',
            permanent: false,
          },
        }
      }

      return {
        props: {
          email,
          isCredential: true
        }
      }
    } catch (error) {
      return {
        redirect: {
          destination: '/onboarding/expired',
          permanent: false,
        },
      }
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}