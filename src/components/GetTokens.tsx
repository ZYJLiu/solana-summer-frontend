import { FC, useState, useEffect, useRef } from "react"
import { Metaplex } from "@metaplex-foundation/js"
import { useWorkspace } from "contexts/Workspace"
import Modal from "./Modal"

export interface Props {
  account: string
}

export const GetTokens: FC<Props> = (props) => {
  const [data, setData] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const [amount, setAmount] = useState("")

  const workspace = useWorkspace()
  const connection = workspace.connection
  const metaplex = new Metaplex(connection)

  const run = useRef(true)
  useEffect(() => {
    const fetchData = async () => {
      const metadata = await metaplex
        .nfts()
        .findByMint(props.account.account.rewardMint)
      let fetchResult = await fetch(metadata.uri)
      let json = await fetchResult.json()
      console.log(json)
      setData(json)
    }
    if (run.current) {
      run.current = false
      fetchData()
    }
  }, [props])

  return (
    <div className="flex text-center">
      {data && (
        <div>
          {/* <img src={data.image} />
                    <ul>{data.name}</ul>
                    <ul>{data.description}</ul> */}
          <input
            type="number"
            className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            placeholder="Enter Checkout Amount"
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="px-1 m-1 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-200 hover:to-yellow-500 ..."
            onClick={() => {
              // setModalData(props.account.publicKey)
              setModalData(props.account)
              setIsOpen(true)
            }}
          >
            Request Payment
          </button>
          {isOpen && (
            <Modal
              amount={amount}
              data={modalData}
              open={isOpen}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
