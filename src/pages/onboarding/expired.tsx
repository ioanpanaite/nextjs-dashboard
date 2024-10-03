import Button from "@/components/shared/Button"
import Link from "next/link"

function Error({ statusCode }: { statusCode: number }) {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">{statusCode === 404 ? "Page not found" : "Opps!"}</h1>
        <p className="mt-6 text-base leading-7 text-gray-light">Sorry, onboarding has expired.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href={"/"} className="bg-blue w-40 py-2 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed">
            Go back home
          </Link>
          <Link href={"/"} className="text-sm font-semibold">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

Error.getInitialProps = ({ res, err }: { res: any, err: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error