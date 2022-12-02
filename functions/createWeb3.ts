import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js"
import { SystemProgram } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../hooks/useProgram/index"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const useCreateWeb3 = () => {
    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    const createProject = async ({ name, group, projectType, reserve, payments, currency, amount, startDate, endDate, client }) => {
        console.log(group.length)
        const [pdaPublicKey] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("project"), Buffer.from(name), Buffer.from(group)],
            program.programId,
          )
        const tx = await program.rpc
            .createProject(
                name,
                group,
                projectType,
                reserve,
                payments,               
                currency,
                new anchor.BN(amount),
                new anchor.BN(startDate),
                new anchor.BN(endDate),
                client,
                {
                    accounts: {
                        project: pdaPublicKey,
                        payer: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    }
                }
            )

        return {
            tx,
            keyProject: pdaPublicKey.toBase58(),
            keyTreasury: pdaPublicKey
        }
    }

    return { createProject: createProject }

} 