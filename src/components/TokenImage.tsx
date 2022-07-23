import { FC, useState, useEffect, useRef } from "react"
import { Metaplex } from "@metaplex-foundation/js"
import { useWorkspace } from "contexts/Workspace"

export interface Props {
    account: string
}

export const TokenImage: FC<Props> = (props) => {
    // console.log(props.account)
    const [data, setData] = useState(null)
    const [modalData, setModalData] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

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
        <div>
            {data && (
                <div>
                    <img src={data.image} />
                </div>
            )}
        </div>
    )
}
