'use client'
import React, { useState, FormEvent } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import { useRouter } from "next/router"
import axios, { isAxiosError } from "axios"
import Input from "@/components/shared/Input"
import Button from "@/components/shared/Button"
import { toast } from "react-toastify"
import Link from "next/link"

export default function SignUp() {
  const [submit, setSubmit] = useState<boolean>(false)
  const router = useRouter()

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = {
      fullname: event.currentTarget.fullname.value,
      username: event.currentTarget.username.value,
      email: event.currentTarget.email.value,
      password: event.currentTarget.password.value,
    }
    // Check email and password empty value
    if (!data.fullname) {
      toast.warning('Please input Full Name.'); return;
    } else if (!data.username) {
      toast.warning('Please input Username.'); return;
    } else if (!data.email || !data.password) {
      toast.warning('Please input email or password.'); return;
    }
    // Set submit
    setSubmit(true)

    try {
      const email = Buffer.from(data.email).toString('base64');
      window.localStorage.setItem('register-refer', email);
      
      const result = await axios.post('/api/auth/signup', data);
      if (result?.data.success) router.replace(`/validate_2fa/email`);
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
              Sign up into our platform
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSignup}>
                <div className="mt-2">
                  <Input type="text" name="fullname" placeholder="Full Name" />
                </div>
                <div className="mt-2">
                  <Input type="text" name="username" placeholder="Username" />
                </div>
                <div className="mt-2">
                  <Input type="email" name="email" placeholder="Email address" />
                </div>
                <div className="mt-2">
                  <Input type="password" name="password" placeholder="Password" />
                </div>

              <Button type="submit" disabled={submit}>
                {!submit && <p className="w-full">Sign up</p>}
              </Button>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Have an account already?{' '}
              <Link href="/signin" className="font-semibold leading-6 text-blue">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}
