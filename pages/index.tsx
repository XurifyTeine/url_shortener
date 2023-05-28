import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form className="flex flex-col items-center justify-center">
        <span className="">
          <label className="mr-2" htmlFor="url">
            URL:
          </label>
          <input className="h-8 p-2 text-black" id="url" />
        </span>
        <button className="bg-white text-black w-48 mt-4 rounded-sm h-6">Create Short URL</button>
      </form>
    </main>
  )
}
