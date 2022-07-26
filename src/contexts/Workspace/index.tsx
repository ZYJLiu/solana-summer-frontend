import { createContext, useContext, ReactNode } from "react"
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import idl from "./idl.json"
import { SolanaSummer } from "./solana_summer"
import { Connection, PublicKey } from "@solana/web3.js"
import MockWallet from "./MockWallet"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"

const WorkspaceContext = createContext({})
const programId = new PublicKey(idl.metadata.address)

interface WorkSpace {
  connection?: Connection
  provider?: AnchorProvider
  program?: Program<SolanaSummer>
}

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useWallet()
  const network = "https://devnet.genesysgo.net/"
  // const network = "https://api.devnet.solana.com/"
  const connection = new Connection(network)
  const provider = new AnchorProvider(connection, wallet, {})

  console.log(programId)

  setProvider(provider)
  const program = new Program(
    idl as Idl,
    programId
  ) as unknown as Program<SolanaSummer>

  const workspace = {
    connection,
    provider,
    program,
  }

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

const useWorkspace = (): WorkSpace => {
  return useContext(WorkspaceContext)
}

export { WorkspaceProvider, useWorkspace }
