import React, { useState, FormEvent, useContext } from "react"
import logo from "@/public/logo.png"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import Button from './../../components/shared/Button';
import Input from "@/components/shared/Input"
import axios, { isAxiosError } from "axios"
import { toast } from "react-toastify"
import Link from "next/link";
import { UIContext } from "@/components/context/UIContextProvider";

export default function RestPassword() {
  const [submit, setSubmit] = useState<boolean>(false);
  const [resetEmail, setEmail] = useState<string>("");
  const { navData } = useContext(UIContext);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Set loading
    setSubmit(true)

    if (!resetEmail) {
      toast.warning('Please input your email.')
      setSubmit(false)
      return;
    }

    try {
      const data = { email: resetEmail }
      const result = await axios.post('/api/reset-password', data);

      if (result?.data.success) {
        toast.success(navData?.site?.reset_pass)
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
    }
    // End submit
    setSubmit(false)
  }

  return (
    <>
      <Layout>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/"><Image alt="Logo" src={logo} className="mx-auto w-auto h-10" /></Link> 
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Reset Password
            </h2>
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="mt-2">
                  <Input type="email" name="email" placeholder="Email address" value={resetEmail} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <Button type="submit" disabled={submit}>
                {!submit && <p className="w-full">Send Email</p>}
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}
