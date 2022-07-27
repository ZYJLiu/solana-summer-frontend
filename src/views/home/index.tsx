// Next, React
import { FC } from "react"
import { ConnectPublicKey } from "components/ConnectPublicKey"

export const HomeView: FC = ({}) => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Connect on Mobile
        </h1>
        <div className="text-center">
          <div>
            <ConnectPublicKey />
          </div>
        </div>
      </div>
    </div>
  )
}
