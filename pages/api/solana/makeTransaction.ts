import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import { couponAddress, shopAddress, usdcAddress } from "../../../lib/addresses"
import BigNumber from "bignumber.js";
import base58 from 'bs58'
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Mate } from "../../../types/mate"
import idl from "../../../hooks/useProgram/mate.json"
import * as web3 from "@solana/web3.js"

const MATE_PROGRAM = idl.metadata.address;
const programID = new PublicKey(MATE_PROGRAM);
const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const connection = new Connection(endpoint)
const signer = web3.Keypair.generate()
const wallet : any= {...signer}
wallet.signAllTransactions=(txs: Transaction[]): Promise<Transaction[]>=>[] as unknown as Promise<Transaction[]>
wallet.signTransaction=(tx: Transaction):Promise<Transaction>=>[] as unknown as Promise<Transaction>
const provider = new anchor.Provider(connection,wallet, {
  preflightCommitment: "recent",
  commitment: "processed",
});
const program = new anchor.Program(idl as any, programID, provider);

export type MakeTransactionInputData = {
  account: string,
}

type MakeTransactionGetResponse = {
  label: string,
  icon: string,
}

export type MakeTransactionOutputData = {
  transaction: string,
  message: string,
}

type ErrorOutput = {
  error: string
}

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Cookies Inc",
    icon: "https://freesvg.org/img/1370962427.png",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {

    const amount = BigNumber(10)
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't checkout with charge of 0" })
      return
    }

    // We pass the reference to use in the query
    const { reference } = req.query
    if (!reference) {
      res.status(400).json({ error: "No reference provided" })
      return
    }

    const { pdaPublicKey } = req.query

    // We pass the bpayer's public key in JSON body
    const { account } = req.body as MakeTransactionInputData
    if (!account) {
      res.status(40).json({ error: "No account provided" })
      return
    }

    const buyerPublicKey = new PublicKey(account)

    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)


    // Get a recent blockhash to include in the transaction
    const { blockhash } = await (connection.getLatestBlockhash('finalized'))

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The buyer pays the transaction fee
      feePayer: buyerPublicKey,
    })

    const member1 = new PublicKey("EjPpXXDykPawauyZHsBMtxGwG7K4iFmxdvB6ockM56ZN")
    const member2 = new PublicKey("CUtKCTar8gb5VYCDWbX5yFMVrhbnod9aCNf4cfhD2qPK")
    const member3 = new PublicKey("6ivuS4xbpr61vMgMwPPnvhSw2sWs4fpKFt7baoiK3s3S")
    const member4 = new PublicKey("8i5WmmdGgibZ36h3xLEDsQ6N8QY71RpZqUoVieYZx1GL")
    const member5 = new PublicKey("GpMhH3hTKdGnJqAaXM9tZoq1GUSFMFNxN8bE5vZzrK6x")
    const member6 = new PublicKey("3dwJ6Xr534orZTwa8n2SJZQNeHY2FWLJ6SpxitBz3wva")
    const member7 = new PublicKey("5G2xXJ46kPo3R4SNmFRCg2z2ru68LCoeoWvZK3FfUGMF")
    const member8 = new PublicKey("6R3MnM7LrMpLSs5NRnniEQ6kDxTHfpY8Qg9hXMKVkaf4")
    const member9 = new PublicKey("EjPpXXDykPawauyZHsBMtxGwG7K4iFmxdvB6ockM56ZN")



    // Create the instruction to send USDC from the buyer to the shop
    const transferInstruction = program.instruction.payProject(
      {
        accounts: {
          payer: buyerPublicKey,
          project: new PublicKey(pdaPublicKey),
          member0: member1,
          member1: member1,
          member2: member2,
          member3: member3,
          member4: member4,
          member5: member5,
          member6: member6,
          member7: member7,
          member8: member8,
          member9: member9,
          systemProgram: SystemProgram.programId,
        }
      })

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    })

    // Add both instructions to the transaction
    transaction.add(transferInstruction)

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize()
    const base64 = serializedTransaction.toString('base64')

    // Insert into database: reference, amount

    const message = "Thanks for your order! 🍪"

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message,
    })
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'error creating transaction', })
    return
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput>
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}