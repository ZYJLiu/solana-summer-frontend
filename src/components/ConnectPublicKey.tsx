import { FC, useState, useEffect, useRef, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"

import Link from "next/link"

export const ConnectPublicKey: FC = () => {
  // form variables
  const [publickey, setPublicKey] = useState("")

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
          <div className="my-6">
            <input
              type="text"
              className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              placeholder="Enter PublicKey"
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <div>
              <button className="px-2 m-1 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-200 hover:to-yellow-500 ...">
                <Link href={publickey}>Connect</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
