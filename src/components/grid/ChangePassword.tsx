import { FormEvent, useContext, useState } from "react";
import Button from "../shared/Button";
import Input from "../shared/Input";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import axios, { isAxiosError } from "axios";
import { UIContext } from "../context/UIContextProvider";

const passwordCheck = (data: any): boolean => {
  if (!data.newPass || !data.currentPass) {
    toast.warning('Please input password correctly.')
    return false;
  } else if (data.newPass !== data.confirmPass) {
    toast.warning('Passsword is not matched.')
    return false;
  }

  return true;
}

export default function ChangePassword() {
  const [submit, setSubmit] = useState<boolean>(false)
  const [isVerify, setVerify] = useState<boolean>(false)
  const [code, setCode] = useState("")
  const [currentPass, setCurrentPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const { navData } = useContext(UIContext);
  
  const { data: session } = useSession();

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
      currentPass: currentPass,
      newPass: newPass,
      confirmPass: confirmPass
    }
    const isValid = passwordCheck(data);
    if (!isValid) return false;

    try {
      setSubmit(true)
      const result = await axios.post('/api/profile/change-password', data)
      if (result?.data.success) {
        toast.success(navData?.site?.change_pass)

        // Show verification code form
        setVerify(true)
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

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast.warning('Something went wrong. please signin again.')
      signOut();
      return;
    }

    const data = {
      currentUserEmail: userEmail,
      code: code,
    }

    try {
      setSubmit(true)
      const result = await axios.post('/api/profile/verify-password', data)
      if (result?.data.success) {
        toast.success(navData?.site?.verify_pass)
        setVerify(false)
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
          <h2 className="font-bold text-lg">Change password</h2>
          <p className="text-sm text-gray-light">Update your password associated with your account.</p>
        </div>
        {!isVerify ?
          <form className="space-y-6 md:col-span-2" onSubmit={handleSubmit}>
            <div>
              <div className="mt-2">
                <Input type="password" name="currentPass" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Current password" />
              </div>
            </div>

            <div>
              <div className="mt-2">
                <Input type="password" name="newPass" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" />
              </div>
            </div>

            <div>
              <div className="mt-2">
                <Input type="password" name="confirmPass" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm password" />
              </div>
            </div>

            <div className="w-32">
              <Button type="submit" disabled={submit}>
                <p className="w-full">Save</p>
              </Button>
            </div>
          </form>
          :
          <form className="space-y-6 md:col-span-2" onSubmit={handleVerify}>
            <div>
              <div className="mt-2">
                <Input type="text" name="code" value={code} onChange={e => setCode(e.target.value)} placeholder="Verification Code" />
              </div>
            </div>

            <div className="w-32">
              <Button type="submit" disabled={submit}>
                <p className="w-full">Confirm</p>
              </Button>
            </div>
          </form>
        }
      </div>
    </>
  )
}