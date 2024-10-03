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

export default function ValidateTwoFactor() {
  const router = useRouter()
  const [submit, setSubmit] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!code) {
      toast.warning("Please input Two-factor Code.")
      return;
    }

    // Set loading
    setSubmit(true)
    try {
      const email = window.localStorage.getItem('register-refer') || "";
      const data = { code, email }
      const response = await axios.post('/api/two-factor/email', data);

      if (response?.data.success) router.replace('/onboarding')
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

  return (
    <>
      <Layout>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Email verification
            </h2>
            <p className="mt-5 text-center text-sm">
              Please enter the code from your registered email.
            </p>
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="mt-2">
                  <Input type="text" placeholder="Verification Code" value={code} onChange={(e) => setCode(e.target.value)} />
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
