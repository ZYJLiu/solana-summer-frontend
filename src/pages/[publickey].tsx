import { useRouter } from "next/router"
import { useWorkspace } from "contexts/Workspace"
import { useEffect, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { GetTokens } from "../components/GetTokens"

export default function Promo() {
  const router = useRouter()
  const { publickey } = router.query
  const workspace = useWorkspace()

  const merchant = new PublicKey(
    publickey || "HexFnfwS4Rp8abu2Y4EnT44NeQf7KFdVdEhYNV2EPvbs"
  ) // placeholder for vercel

  const [account, setAccount] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const account = await workspace.program?.account.tokenData.all([
        {
          memcmp: {
            offset: 8,
            bytes: merchant.toBase58(),
          },
        },
      ])
      setAccount(account)
    }
    try {
      fetchData()
    } catch {}
  }, [publickey])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        {account && (
          <div>
            {Object.keys(account).map((key, index) => {
              const data = account[key]
              return <GetTokens key={key} account={data} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
