import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function ThankYou() {

  return (
    <>
      <Layout>
        <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-md">Oops!</h1>
            <p className="mt-6 text-base leading-7 text-gray-light">Please contact support team if you any questions.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={"/"} className="bg-blue w-40 py-2 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed">
                Back home!
              </Link>
              <Link href={"/"} className="text-sm font-semibold">
                Contact support <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}