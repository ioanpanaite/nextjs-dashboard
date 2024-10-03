import { FormEvent, useState } from "react";
import Button from "../shared/Button";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import axios, { isAxiosError } from "axios";

export default function DeleteAccount() {
  const [send, setSend] = useState<boolean>(false)
  const { data: session } = useSession();

  const handleAction = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast.warning('Something went wrong. please signin again.')
      signOut();
      return;
    }

    try {
      setSend(true)
      const result = await axios.post('/api/profile/delete-account', { userEmail })
      if (result?.data.success) toast.success(result?.data.message)
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
    }

    // End submit
    setSend(false)
  }
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1 py-10 border-b border-gray-regular">
        <div>
          <h2 className="font-bold text-lg">Delete account</h2>
          <p className="text-sm text-gray-light">No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently.</p>
        </div>
        <Button type="button" disabled={send} onClick={handleAction}>
          {!send && <p className="w-full">Yes, delete my account</p>}
        </Button>
      </div>
    </>
  )
}