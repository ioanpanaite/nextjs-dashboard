import Button from '@/components/shared/Button';
import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type PricesProps = {
  prices: any;
  person: string
}

export default function Prices(props: PricesProps) {
  const { prices, person } = props;
  const [filterPrice, setFilterPrice] = useState([])
  const [lookupKey, setLookupKey] = useState()
  const [submit, setSubmit] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (prices && prices.length > 0) {
      const list = prices.sort((a: any, b: any) => a.unit_amount - b.unit_amount)
      const filterList = list.filter((v: any) => v.product.active != false)
      setFilterPrice(filterList)
    }

    const profileInfo = async () => {
      const data = { email: person }
      const result = await axios.post('/api/profile/profile-info', data)
      
      if (result?.data.success) {
        const info = result?.data.info
        setLookupKey(info.lookupKey)
      } else {
        toast.warning('Something went wrong.')
      }
    }
    profileInfo()
  }, [prices, person])

  const handleSelect = async () => {
    setSubmit(true)
    try {
      const info = { lookup_key: lookupKey, email: person }
      const response = await axios.post('/api/profile/plan', info);

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
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1 py-10 border-b border-gray-regular">
        <div>
          <h2 className="font-bold text-lg">Select a plan</h2>
          <p className="text-sm text-gray-light">You can select a plan.</p>
        </div>
        <div className='space-y-6 md:col-span-2'>
          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            {filterPrice && filterPrice.map((price: any, k: number) => {
              return (
                lookupKey ?
                <div key={price.id} className={`relative my-4 ${ lookupKey === price.lookup_key ? "bg-[radial-gradient(164.75%_100%_at_50%_0%,#334155_0%,#0F172A_48.73%)] shadow-lg sm:mx-0 sm:rounded-2xl" : ""}`} onClick={() => setLookupKey(price.lookup_key)}>
                  <input className="peer hidden" id={`radio_${k}`} value={price.lookup_key} type="radio" name="lookup_key" defaultChecked={lookupKey === price.lookup_key} />
                  <span className="absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-lightest bg-black peer-checked:border-gray-light"></span>
                  <label className="flex cursor-pointer flex-col rounded-2xl border border-gray-lightest bg-slate-100/80 p-4 pr-8 sm:pr-16" htmlFor={`radio_${k}`}>
                    <span className="mb-2 text-lg font-semibold">{price.product.name}</span>
                    <p className="text-2xl my-10">
                      <strong className="text-3xl">{price.unit_amount / 100}</strong> {price.currency.toUpperCase()} / month
                    </p>
                    <p className="text-sm sm:text-base text-gray-light">{price.product.description}</p>
                  </label>
                </div>
                : null
              )
            })}
          </div>
          <div className="w-32">
            <Button onClick={() => handleSelect()} disabled={submit}>
              <p className="w-full">Save</p>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}