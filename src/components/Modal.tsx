import { useEffect, useMemo, useRef } from "react"
import styles from "../styles/custom.module.css"

import {
    createQR,
    createQROptions,
    encodeURL,
    TransferRequestURLFields,
    findReference,
    validateTransfer,
    FindReferenceError,
    ValidateTransferError,
    TransactionRequestURLFields,
} from "@solana/pay"

import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js"
import PageHeading from "./PageHeading"
// import BackLink from "./BackLink";
import { FC, useCallback, useState } from "react"
import { useWorkspace } from "contexts/Workspace"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"

import { useRouter } from "next/router"

import Confirmed from "../../src/components/Confirmed"

const MODAL_STYLES = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#FFF",
    padding: "10px",
    zIndex: 1000,
}

const OVERLAY_STYLES = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
}

// modal to display attributes
export default function Modal({ open, data, onClose, amount }) {
    if (!open) return null

    const router = useRouter()
    const workspace = useWorkspace()

    // Get a connection to Solana devnet
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = workspace.connection

    const [reference, setReference] = useState(Keypair.generate().publicKey)

    const { publicKey } = useWallet()

    const [confirmed, setConfirmed] = useState(false)

    //QR code
    const searchParams = new URLSearchParams()

    // const reference = useMemo(() => Keypair.generate().publicKey, [])
    searchParams.append("reference", reference.toString())
    searchParams.append("checkout", amount.toString())
    searchParams.append("wallet", data.account.user.toString())

    console.log("data", data.account.user)

    const [size, setSize] = useState(() =>
        typeof window === "undefined"
            ? 400
            : Math.min(window.screen.availWidth - 10, 512)
    )

    useEffect(() => {
        const listener = () =>
            setSize(Math.min(window.screen.availWidth - 10, 512))

        window.addEventListener("resize", listener)
        return () => window.removeEventListener("resize", listener)
    }, [])

    const qrRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const { location } = window
        const apiUrl = `${location.protocol}//${
            location.host
        }/api/makeTransaction?${searchParams.toString()}`
        const urlParams: TransactionRequestURLFields = {
            link: new URL(apiUrl), // testing placeholder
            label: "Test",
            message: "Test Message",
        }
        const solanaUrl = encodeURL(urlParams)
        const qr = createQR(solanaUrl, size, "white")

        if (qrRef.current) {
            qrRef.current.innerHTML = ""
            qr.append(qrRef.current)
        }
    }, [data])

    // Check every 0.5s if the transaction is completed
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Check if there is any transaction for the reference
                const signatureInfo = await findReference(
                    connection,
                    reference,
                    {
                        finality: "confirmed",
                    }
                )
                setConfirmed(true)
                // router.push("/confirmedNft")
                // console.log("confirmed");
            } catch (e) {
                if (e instanceof FindReferenceError) {
                    // No transaction found yet, ignore this error
                    return
                }
                if (e instanceof ValidateTransferError) {
                    // Transaction is invalid
                    console.error("Transaction is invalid", e)
                    return
                }
                console.error("Unknown error", e)
            }
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [reference.toString()])

    return (
        <div>
            <div style={OVERLAY_STYLES} />
            <div style={MODAL_STYLES}>
                {confirmed ? (
                    <div style={{ width: size }}>
                        <Confirmed />
                    </div>
                ) : (
                    <div>
                        <div ref={qrRef} />
                    </div>
                )}
                <button
                    className=" btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    )
}
