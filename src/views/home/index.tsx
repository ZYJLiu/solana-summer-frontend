// Next, React
import { FC } from "react"
import { CreateRewardToken } from "components/CreateRewardTokenForm"

export const HomeView: FC = ({}) => {
    return (
        <div className="md:hero mx-auto p-4">
            <div className="md:hero-content flex flex-col">
                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
                    Create Your Reward Token
                </h1>
                <div className="text-center">
                    <div>
                        <CreateRewardToken />
                    </div>
                </div>
            </div>
        </div>
    )
}
