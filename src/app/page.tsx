import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Medical Imaging Platform
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
          <Link href="/auth/login" 
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Login{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Access your clinic's imaging dashboard
            </p>
          </Link>

          <div className="group rounded-lg border border-transparent px-5 py-4">
            <h2 className="mb-3 text-2xl font-semibold">
              Features
            </h2>
            <ul className="m-0 max-w-[30ch] text-sm opacity-50 list-disc list-inside">
              <li>Secure image storage</li>
              <li>Multi-clinic support</li>
              <li>Advanced viewer</li>
              <li>Role-based access</li>
            </ul>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4">
            <h2 className="mb-3 text-2xl font-semibold">
              Security
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Enterprise-grade security with end-to-end encryption and HIPAA compliance
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 