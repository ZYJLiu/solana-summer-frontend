import { useRouter } from "next/router"
import { useWorkspace } from "contexts/Workspace"
import { useEffect, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { GetTokens } from "../components/GetTokens"

import styles from "../../styles/custom.module.css"

export default function Promo() {
  const router = useRouter()
  const { publickey } = router.query
  const workspace = useWorkspace()

  const merchant = new PublicKey(
    publickey || "HexFnfwS4Rp8abu2Y4EnT44NeQf7KFdVdEhYNV2EPvbs"
  ) // placeholder for vercel

  const [accounts, setAccounts] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const accounts = await workspace.program?.account.tokenData.all([
        {
          memcmp: {
            offset: 8,
            bytes: merchant.toBase58(),
          },
        },
      ])
      setAccounts(accounts)
    }
    fetchData()
  }, [publickey])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        {accounts && (
          <div>
            {Object.keys(accounts).map((key, index) => {
              const data = accounts[key]
              return <GetTokens key={key} account={data} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
