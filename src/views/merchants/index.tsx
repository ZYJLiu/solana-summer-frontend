import { FC, useEffect, useState } from "react"
import Link from "next/link"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"

import { useWorkspace } from "contexts/Workspace"
import styles from "../../styles/custom.module.css"
import { TokenImage } from "../../components/TokenImage"

export const MerchantsView: FC = ({}) => {
    const [merchant, setMerchant] = useState(null)

    const { connection } = useConnection()

    const workspace = useWorkspace()

    useEffect(() => {
        if (connection) {
            async function merchantInfo() {
                try {
                    const merchants =
                        await workspace.program.account.tokenData.all()
                    console.log(merchants)
                    setMerchant(merchants)
                } catch (error: unknown) {}
            }
            merchantInfo()
        }
    }, [connection])

    return (
        <div className="md:hero mx-auto p-4">
            <div className="md:hero-content flex flex-col">
                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
                    Merchants
                </h1>
                <div className="text-center">
                    {merchant ? (
                        <div className={styles.gridNFT}>
                            {Object.keys(merchant).map((key, index) => {
                                const data = merchant[key]
                                return (
                                    <div>
                                        <div>
                                            <TokenImage
                                                key={key}
                                                account={data}
                                            />
                                        </div>
                                        <div>
                                            <button className="px-2 m-1 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-200 hover:to-yellow-500 ...">
                                                <Link
                                                    href={
                                                        `merchants/` +
                                                        data.account.user.toString()
                                                    }
                                                >
                                                    Button
                                                </Link>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <>No Promotions to Display</>
                    )}
                </div>
            </div>
        </div>
    )
}
