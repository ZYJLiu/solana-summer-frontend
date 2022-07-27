// Next, React
import { FC } from "react"
import { UpdateRewardToken } from "components/UpdateRewardTokenForm"
import { UpdateLoyaltyToken } from "components/UpdateLoyaltyTokenForm"
import styles from "../../styles/custom.module.css"

export const UpdateView: FC = ({}) => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Update Metadata
        </h1>
        <div className="text-center">
          <div className={styles.row}>
            <div className="md:hero-content">
              <UpdateRewardToken />
            </div>
            <div className="md:hero-content">
              <UpdateLoyaltyToken />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
