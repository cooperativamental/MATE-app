import { useRouter } from "next/router"
import Link from "next/link"
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import CreateIcon from '@mui/icons-material/Create';
import FolderIcon from '@mui/icons-material/Folder';
import { useBalance } from "../../../context/contextBalance";

const BottomBar = () => {
    const router = useRouter()
    const { handleOpeners, openers } = useBalance()
    const selected = (condition) => {
        return (`grid py-2 grid-rows-[auto_1fr] justify-items-center text-center items-center h-full w-full ${condition ? "border-t-2 border-purple-900" : undefined}`)
    }


    return (
        <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] shadow-[#5A31E1] shadow-[0px_0px_10px] w-full h-[5.30rem] bottom-0 z-20 text-white font-bold"
        >
            <Link href="/groups" >
                <a
                    className={selected(router?.asPath === "/team" && !openers.withdraw)}
                >

                    <GroupWorkIcon
                        sx={{ fontSize: 30 }}
                        alt="Teams"
                    />
                    <p>Teams</p>
                </a>
            </Link>
            <Link href="/wallet" >
                <a
                    className={selected(router?.asPath === "/wallet" && !openers.withdraw)}
                >
                    <AccountBalanceWalletIcon />
                    <p>Wallet</p>
                </a>
            </Link>
            <div
                className={` cursor-pointer ${selected(openers?.withdraw)}`}
                onClick={() => { handleOpeners("withdraw") }
                }
            >

                <PaidIcon
                    sx={{ fontSize: 30 }}
                />
                <p>Whitdrawal</p>
            </div>
            <Link
                href={{
                    pathname: "/createproject",
                }}

            >
                <a
                    className={selected(router?.asPath === "/createproject")}
                >
                    <CreateIcon
                        sx={{ fontSize: 30 }}
                    />
                    <p>Create Project</p>
                </a>
            </Link>
            <Link
                href={{
                    pathname: "/adminprojects",

                }}
                passHref
            >
                <a
                    className={selected(router?.asPath === "/adminprojects")}
                >
                    <FolderIcon
                        sx={{ fontSize: 30 }}
                    />
                    <p>Admin Projects</p>
                </a>
            </Link>

        </div>
    )
}

export default BottomBar