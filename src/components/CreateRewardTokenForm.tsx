import { FC, useState, useEffect, useRef, useCallback } from "react"
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
    Metaplex,
    walletAdapterIdentity,
    bundlrStorage,
    MetaplexFile,
    useMetaplexFileFromBrowser,
    findMetadataPda,
} from "@metaplex-foundation/js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

import { notify } from "../utils/notifications"
import BN from "bn.js"

import { useWorkspace } from "contexts/Workspace"

export const CreateRewardToken: FC = () => {
    // setup
    const wallet = useWallet()
    const { publicKey, sendTransaction } = useWallet()
    const { connection } = useConnection()
    const workspace = useWorkspace()

    // bundlr uploads
    const [imageUrl, setImageUrl] = useState(null)
    const [metadataUrl, setMetadataUrl] = useState(null)

    // form variables
    const [tokenName, setTokenName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [description, setDescription] = useState("")

    // transaction signature
    const [transaction, setTransaction] = useState("")

    const urlMounted = useRef(false)

    const program = workspace.program

    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    )

    // set up metaplex object
    const metaplex = new Metaplex(connection).use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        })
    )

    if (wallet) {
        metaplex.use(walletAdapterIdentity(wallet))
    }

    // upload image
    const handleImage = async (event) => {
        const file: MetaplexFile = await useMetaplexFileFromBrowser(
            event.target.files[0]
        )

        const imageUrl = await metaplex.storage().upload(file)
        setImageUrl(imageUrl)
        console.log(imageUrl)
    }

    // upload metadata
    const uploadMetadata = async () => {
        const { uri, metadata } = await metaplex.nfts().uploadMetadata({
            name: tokenName,
            symbol: symbol,
            description: description,
            image: imageUrl,
        })
        setMetadataUrl(uri)
        console.log(uri)
    }

    // build and send transaction
    const createPromo = useCallback(
        async (form) => {
            if (!publicKey) {
                console.log("error", "Wallet not connected!")
                return
            }

            // get pda to store data
            const [rewardDataPda] = await PublicKey.findProgramAddress(
                [Buffer.from("RewardData"), publicKey.toBuffer()],
                program.programId
            )

            // get pda for token mint / mint authority
            const [rewardMintPda] = await PublicKey.findProgramAddress(
                [Buffer.from("Mint"), rewardDataPda.toBuffer()],
                program.programId
            )

            // get metadata pda for token mint
            const metadataPDA = await findMetadataPda(rewardMintPda)

            // build transaction to create token mint
            const transaction = await program.methods
                .createRewardMint(
                    new BN(100),
                    new BN(50),
                    form.metadata.toString(),
                    form.tokenName.toString(),
                    form.symbol.toString()
                )
                .accounts({
                    rewardData: rewardDataPda,
                    rewardMint: rewardMintPda,
                    user: publicKey,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    metadata: metadataPDA,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                })
                .transaction()

            const transactionSignature = await sendTransaction(
                transaction,
                connection
            )

            const url = `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
            console.log(url)

            notify({
                type: "success",
                message: `Reward Token Created`,
            })

            setTransaction(url)
        },
        [publicKey, connection, sendTransaction]
    )

    // send transaction once metadata uplaoded
    useEffect(() => {
        if (urlMounted.current && metadataUrl != null) {
            createPromo({
                metadata: metadataUrl,
                symbol: "Promo",
                tokenName: tokenName,
            })
        } else {
            urlMounted.current = true
        }
    }, [metadataUrl])

    // check wallet connection
    useEffect(() => {
        if (wallet && wallet.connected) {
            async function connectProvider() {
                await wallet.connect()
                const provider = wallet.wallet.adapter
                await provider.connect()
            }
            connectProvider()
        }
    }, [wallet])

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                        <div className="px-4 py-5 bg-white space-y-6 sm:p-6"></div>
                    </div>
                </div>

                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                        {!transaction ? (
                            <div className="mt-1 sm:mt-0 sm:col-span-1">
                                <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="image-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-purple-500 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                {!imageUrl ? (
                                                    <div>
                                                        <span>
                                                            Upload Promo Image
                                                        </span>
                                                        <input
                                                            id="image-upload"
                                                            name="image-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={
                                                                handleImage
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span>
                                                            Image Uploaded
                                                        </span>
                                                        <img src={imageUrl} />
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-1 py-1 bg-white space-y-1 sm:p-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Promo Created
                                </h3>
                                <a
                                    href={transaction}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Click Here to View Transaction
                                </a>
                                <img src={imageUrl} />
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                        <div className="my-6">
                            <input
                                type="text"
                                className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Token Name"
                                onChange={(e) => setTokenName(e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Symbol"
                                onChange={(e) => setSymbol(e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Description"
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button
                                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                                onClick={async () => uploadMetadata()}
                            >
                                <span>Create Token</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
