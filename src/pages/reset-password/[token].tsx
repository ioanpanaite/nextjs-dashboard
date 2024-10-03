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

export default function RestPassword() {
  const router = useRouter()
  const [submit, setSubmit] = useState<boolean>(false);
  const [newPass, setNewPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const { query } = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (newPass !== confirmPass) {
      toast.warning("Password is not matched.")
      return;
    } else if (!newPass || !confirmPass) {
      toast.warning("Please set the password.")
      return;
    }

    // Set loading
    setSubmit(true)
    try {
      const data = { newPass, token: query?.token }
      const response = await axios.put('/api/reset-password', data);
      if (response?.data.success) router.replace('/')
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
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
              Reset Password
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="mt-2">
                  <Input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>

                <div className="mt-2">
                  <Input type="password" placeholder="Confirm password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                </div>
              </div>


              <Button type="submit" disabled={submit}>
                {!submit && <p className="w-full">Confirm</p>}
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}
