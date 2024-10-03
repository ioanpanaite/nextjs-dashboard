import { FormEvent, useCallback, useEffect, useState } from "react";
import Button from "../shared/Button";
import Input from "../shared/Input";
import { toast } from 'react-toastify';
import axios, { isAxiosError } from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/router'

export default function Personal({ person }: { person: string }) {
  const [submit, setSubmit] = useState<boolean>(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const { data: session } = useSession();
  const router = useRouter();

  const profileInfo = useCallback(async () => {
    if (person) {
      const data = { email: person }
      const result = await axios.post('/api/profile/profile-info', data)
      if (result?.data.success) {
        const info = result?.data.info
        setUsername(info.username)
        setEmail(info.email)
      } else {
        toast.warning('Something went wrong.')
      }
    }
  }, [person])

  useEffect(() => {
    profileInfo();
  }, [])


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast.warning('Something went wrong. please signin again.')
      signOut();
      return;
    }

    const data = {
      currentUserEmail: userEmail,
      email: email
    }
    if (!data.email) {
      toast.warning('Please input email.')
      return;
    }

    try {
      setSubmit(true)
      const result = await axios.post('/api/profile/personal', data)
      if (result?.data.success) { 
        toast.success(result?.data.message)
        const data = await signOut({redirect: false, callbackUrl: "/"})
        router.push(data.url)
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
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1 py-10 border-b border-gray-regular">
        <div>
          <h2 className="font-bold text-lg">Personal Information</h2>
          <p className="text-sm text-gray-light">Use a permanent address where you can receive mail.</p>
        </div>
        <form className="space-y-6 md:col-span-2" onSubmit={handleSubmit}>
          <div>
            <div className="mt-2">
              <Input type="email" name="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
            </div>
          </div>

          <div className="w-32">
            <Button type="submit" disabled={submit}>
              {!submit && <p className="w-full">Save</p>}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}