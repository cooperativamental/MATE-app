import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../hooks/useProgram/index"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const useCreateWeb3 = () => {
    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    const createProject = async ({ name, group, projectType, reserve, payments, currency, amount, startDate, endDate, client }) => {
        const keyProject = anchor.web3.Keypair.generate();
        const keyTreasury = anchor.web3.Keypair.generate();
        const tx = await program.rpc
            .createProject(
                name,
                group,
                projectType,
                reserve,
                payments,
                "",
                currency,
                new anchor.BN(amount),
                new anchor.BN(startDate),
                new anchor.BN(endDate),
                client,
                {
                    accounts: {
                        project: keyProject.publicKey,
                        treasury: keyTreasury.publicKey,
                        initializer: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    },
                    signers: [keyProject]
                }
            )

        return {
            tx,
            keyProject: keyProject.publicKey.toBase58(),
            keyTreasury: keyTreasury
        }
    }

    return { createProject: createProject }

} 