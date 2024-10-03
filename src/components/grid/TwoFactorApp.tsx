import { useContext, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import axios, { isAxiosError } from "axios";
import { UIContext } from "../context/UIContextProvider";

export default function TwoFactorApp() {
  const [twofactorCheck, setCheckStatus] = useState<boolean>(false);
  const { data: session } = useSession();
  const { navData } = useContext(UIContext);

  useEffect(() => {
    handleInitial();
  }, []);

  const handleInitial = async () => {
    try {
      const userEmail = session?.user?.email;
      const result = await axios.post('/api/two-factor/status', { email: userEmail })
      if (result?.data.success) setCheckStatus(true)
      else setCheckStatus(false)
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
    }
  }

  const handleAction = async (status: boolean) => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast.warning('Something went wrong. please signin again.')
      signOut();
      setCheckStatus(false);
      return;
    }

    // Set status of two factor authentication
    setCheckStatus(status);

    try {
      if (status) {
        const result = await axios.post('/api/two-factor/enable', { email: userEmail })
        if (result?.data.success) toast.success(navData?.site?.twofactor_enable)
        setCheckStatus(true);
      } else {
        const result = await axios.post('/api/two-factor/disable', { email: userEmail })
        if (result?.data.success) toast.success(navData?.site?.twofactor_disable)
        setCheckStatus(false);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.warning(data.message)
      } else {
        toast.error('Something went wrong.')
      }
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1 py-10 border-b border-gray-regular">
        <div>
          <h2 className="font-bold text-lg">Two Factor Authenticator</h2>
          <p className="text-sm text-gray-light">Enable Two Factor Authentication when you sign in for more securely.</p>
        </div>
        <div>
          <label className="relative inline-flex items-center mr-5 cursor-pointer mt-6">
            <input type="checkbox" name="twofactor" className="sr-only peer" onChange={e => handleAction(e.target.checked)} checked={twofactorCheck} />
            <div className="w-11 h-6 bg-gray-lightest rounded-full peer dark:bg-gray-light peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-light peer-checked:bg-green"></div>
            <span className="ml-3 text-md font-medium text-gray-light dark:text-gray-light">{twofactorCheck ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
      </div>
    </>
  )
}