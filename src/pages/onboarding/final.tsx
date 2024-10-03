'use client'
import React, { useState, FormEvent, Fragment, useEffect } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import { useRouter } from "next/router"
import Button from '@/components/shared/Button';
import Input from "@/components/shared/Input"
import axios, { isAxiosError } from "axios"
import { toast } from "react-toastify"
import Link from "next/link"
import { getPaymentInfo } from "@/utils/payment"
import type { GetServerSideProps, GetServerSidePropsContext, GetStaticProps, InferGetStaticPropsType } from "next"
import { EXPIRE_TIME } from "@/lib/utils"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import { getPasswordStatus, getStatusUser } from "@/utils/validation"

export default function Final({ email, config }: InferGetStaticPropsType<GetStaticProps>) {
  const router = useRouter()
  const [submit, setSubmit] = useState<boolean>(false);
  const [showStripe, setShowStripe] = useState(false)
  const [showPromo, setShowPromo] = useState(false)
  const [filterPrice, setFilterPrice] = useState([])

  const { prices } = config;
  useEffect(() => {
    const list = prices.sort((a: any, b: any) => a.unit_amount - b.unit_amount)
    const filterList = list.filter((v: any) => v.product.active != false)
    setFilterPrice(filterList)
  }, [prices])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = {
      promo_code: event.currentTarget.promo_code?.value,
      lookup_key: event.currentTarget.lookup_key?.value,
    }

    // Set loading
    setSubmit(true)
    try {
      const info = { ...formData, email }
      const response = await axios.post('/api/payment/onboard', info);

      if (response?.data.success) router.replace(response?.data.url)
      else toast.error(response?.data.message)
      setSubmit(false)
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
      // End loading
      setSubmit(false)
    }
  }


  const handleShowStripe = () => {
    setShowStripe(!showStripe)
    setShowPromo(false)
  }

  const handleShowPromo = () => {
    setShowPromo(!showPromo)
    setShowStripe(false)
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
            <h3 className="mt-10 text-center">Set up your payment</h3>
            <p className="mt-2 text-center text-sm sm:text-base text-gray-light">Your membership starts as soon as you set up payment.</p>
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div onClick={handleShowStripe}>
                <label className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-black border border-gray-200 rounded-lg cursor-pointer">
                  <div className="block">
                    <div className="w-full text-lg font-semibold">Stripe Payment</div>
                  </div>
                  <svg className="w-5 h-5 ms-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </label>
              </div>
              {
                showStripe ?
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    {
                      filterPrice && filterPrice.map((price: any, k: number) => {
                        if (price.product.active) {
                          return (
                            <div key={price.id} className="relative my-4">
                              <input className="peer hidden" id={`radio_${k}`} value={price.lookup_key} type="radio" name="lookup_key" defaultChecked={k === 0} />
                              <span className="absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-lightest bg-black peer-checked:border-gray-light"></span>
                              <label className="flex cursor-pointer flex-col rounded-2xl border border-gray-lightest bg-slate-100/80 p-4 pr-8 sm:pr-16" htmlFor={`radio_${k}`}>
                                <span className="mb-2 text-lg font-semibold">{price.product.name}</span>
                                <p className="text-2xl my-10">
                                  <strong className="text-3xl">{price.unit_amount / 100}</strong> {price.currency.toUpperCase()} / month
                                </p>
                                <p className="text-sm sm:text-base text-gray-light">{price.product.description}</p>
                              </label>
                            </div>
                          )
                        } else {
                          return null
                        }
                      })
                    }
                  </div>
                  : null
              }

              <div className="mt-2" onClick={handleShowPromo}>
                <label className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-black border border-gray-200 rounded-lg cursor-pointer">
                  <div className="block">
                    <div className="w-full text-lg font-semibold">Promo Code</div>
                  </div>
                  <svg className="w-5 h-5 ms-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </label>
              </div>
              {
                showPromo ?
                  <div className="mt-2">
                    <Input type="text" name="promo_code" placeholder="Promo Code" />
                  </div>
                  : null
              }

              <div className="m-auto sm:max-w-sm">
                <Button type="submit" disabled={submit}>
                  {!submit && <p className="w-full">Continue</p>}
                </Button>
              </div>
            </form>
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
    const config = await getPaymentInfo();

    return {
      props: {
        email: userEmail,
        config
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
      const config = await getPaymentInfo();

      return {
        props: {
          email,
          config
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
    props: {
      email: null,
      config: null
    }
  }
}