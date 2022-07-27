//ngrok http 3000

import {
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  getAccount,
  Account,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import { usdcAddress } from "../../lib/addresses"
import BN from "bn.js"

import { createRedeemInstruction } from "../../../programs/instructions/redeem"
import { createMintNftInstruction } from "../../../programs/instructions/mintNft"
import idl from "../../../programs/solana_summer.json"

export type MakeTransactionInputData = {
  account: string
}

type MakeTransactionGetResponse = {
  label: string
  icon: string
}

export type MakeTransactionOutputData = {
  transaction: string
  message: string
}

type ErrorOutput = {
  error: string
}

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Cookies Inc",
    icon: "https://freesvg.org/img/1370962427.png",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  // const workspace = useWorkspace()
  try {
    const { checkout } = req.query
    if (!checkout) {
      console.log("Returning 400: No checkout amount")
      res.status(400).json({ error: "No checkout amount provided" })
      return
    }

    // We pass the reference to use in the query
    const { reference } = req.query
    if (!reference) {
      console.log("Returning 400: no reference")
      res.status(400).json({ error: "No reference provided" })
      return
    }

    // We pass the buyer's public key in JSON body
    const { account } = req.body as MakeTransactionInputData
    if (!account) {
      console.log("Returning 400: no account")
      res.status(400).json({ error: "No account provided" })
      return
    }

    const { wallet } = req.query
    if (!wallet) {
      console.log("Returning 400: no wallet")
      res.status(400).json({ error: "No wallet provided" })
      return
    }

    const { discount } = req.query
    if (!discount) {
      console.log("Returning 400: no discount percent")
      res.status(400).json({ error: "No discount percent provided" })
      return
    }

    const publicKey = new PublicKey(wallet)

    const buyerPublicKey = new PublicKey(account)

    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    // const connection = new Connection(endpoint)
    const connection = new Connection("https://devnet.genesysgo.net/")

    const programId = new PublicKey(idl.metadata.address)

    // Get details about the USDC token
    const usdcMint = await getMint(connection, usdcAddress)

    // Get a recent blockhash to include in the transaction
    const { blockhash } = await connection.getLatestBlockhash("finalized")

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    })

    const [rewardDataPda, rewardDataBump] = await PublicKey.findProgramAddress(
      [Buffer.from("RewardData"), publicKey.toBuffer()],
      programId
    )

    const [rewardMintPda, rewardMintBump] = await PublicKey.findProgramAddress(
      [Buffer.from("Mint"), rewardDataPda.toBuffer()],
      programId
    )

    const [loyaltyMintPda, loyaltyMintBump] =
      await PublicKey.findProgramAddress(
        [Buffer.from("Loyalty"), rewardDataPda.toBuffer()],
        programId
      )

    const rewardTokenAccount = await getAssociatedTokenAddress(
      rewardMintPda,
      buyerPublicKey
    )

    const loyaltyTokenAccount = await getAssociatedTokenAddress(
      loyaltyMintPda,
      buyerPublicKey
    )

    const usdcTokenAccount = await getAssociatedTokenAddress(
      usdcMint.address,
      buyerPublicKey
    )

    const userUsdcToken = await getAssociatedTokenAddress(
      usdcMint.address,
      publicKey
    )

    const createAccountInstruction = createAssociatedTokenAccountInstruction(
      buyerPublicKey,
      rewardTokenAccount,
      buyerPublicKey,
      rewardMintPda,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const createNftAccountInstruction = createAssociatedTokenAccountInstruction(
      buyerPublicKey,
      loyaltyTokenAccount,
      buyerPublicKey,
      loyaltyMintPda,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const mintNftInstruction = createMintNftInstruction({
      rewardData: rewardDataPda,
      loyaltyMint: loyaltyMintPda,
      user: publicKey,
      customerNft: loyaltyTokenAccount,
      customer: buyerPublicKey,
    })

    let checkoutAmount = +checkout * 10 ** usdcMint.decimals
    let rewardTokenAmount = 0

    let buyerNft: Account
    try {
      buyerNft = await getAccount(
        connection,
        loyaltyTokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      )
      if (buyerNft) {
        checkoutAmount = checkoutAmount * (1 - +discount / 10000)
      }
    } catch (error: unknown) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        try {
          transaction.add(createNftAccountInstruction)
          transaction.add(mintNftInstruction)
        } catch (error: unknown) {}
      } else {
        throw error
      }
    }

    let buyer: Account
    try {
      buyer = await getAccount(
        connection,
        rewardTokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      )
      if (checkoutAmount - Number(buyer.amount) > 0) {
        checkoutAmount -= Number(buyer.amount)
        rewardTokenAmount = Number(buyer.amount)
      } else {
        rewardTokenAmount = checkoutAmount
        checkoutAmount = 0
      }
    } catch (error: unknown) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        try {
          transaction.add(createAccountInstruction)
        } catch (error: unknown) {}
      } else {
        throw error
      }
    }

    const transferInstruction = createRedeemInstruction(
      {
        rewardData: rewardDataPda,
        rewardMint: rewardMintPda,
        usdcMint: usdcAddress,
        customerRewardToken: rewardTokenAccount,
        customerUsdcToken: usdcTokenAccount,
        userUsdcToken: userUsdcToken,
        user: publicKey,
        customer: buyerPublicKey,
      },
      {
        usdcToken: +checkoutAmount,
        rewardToken: +rewardTokenAmount,
      }
    )

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    })

    // Add both instructions to the transaction
    transaction.add(transferInstruction)

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
      // We will need the buyer to sign this transaction after it's returned to them
      requireAllSignatures: false,
    })

    const base64 = serializedTransaction.toString("base64")

    // Insert into database: reference, amount

    const message = "Test Message"

    // Return the serialized transaction
    const responseBody = {
      transaction: base64,
      message,
    }

    console.log("returning 200", responseBody)
    res.status(200).json(responseBody)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "error creating transaction" })
    return
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput
  >
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}
