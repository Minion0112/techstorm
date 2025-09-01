'use client'

export default function AuthCodeError() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-black">Authentication Error</h1>
        <p className="text-center text-gray-600">There was an error authenticating your account. Please try again.</p>
      </div>
    </div>
  )
}
