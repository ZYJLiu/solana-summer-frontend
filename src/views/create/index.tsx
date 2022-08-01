// Next, React
import { FC, useState } from "react"
import { CreateRewardToken } from "components/CreateRewardTokenForm"
import { CreateLoyaltyToken } from "components/CreateLoyaltyTokenForm"
import styles from "../../styles/custom.module.css"

export const CreateView: FC = ({}) => {
  const [load, setLoad] = useState(false)
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Create Your Rewards
        </h1>
        <div className="text-center">
          {load ? (
            <div className="md:hero-content">
              <CreateLoyaltyToken />
            </div>
          ) : (
            <div className="md:hero-content">
              <CreateRewardToken setLoad={setLoad} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
