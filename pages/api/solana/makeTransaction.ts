import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import BigNumber from "bignumber.js";

export type MakeTransactionInputData = {
  account: string,
}

export type MakeTransactionOutputData = {
  transaction: string,
  message: string,
}

type ErrorOutput = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {
    // We pass the selected items in the query, calculate the expected cost
    const amount = new BigNumber(req.query.amount as string ?? 0)
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't checkout with charge of 0" })
      return
    }

    const payerPublicKey = new PublicKey(req.query.payerPublicKey)
    const projectPublicKey = new PublicKey(req.query.projectPublicKey)

    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    // Get a recent blockhash to include in the transaction
    const { blockhash } = await (connection.getLatestBlockhash('finalized'))

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The buyer pays the transaction fee
      feePayer: payerPublicKey,
    })

    // Create the instruction to send SOL from the buyer to the shop
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: projectPublicKey,
    })

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    /*transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    })*/

    // Add the instruction to the transaction
    transaction.add(transferInstruction)

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
      // We will need the buyer to sign this transaction after it's returned to them
      requireAllSignatures: false
    })
    const base64 = serializedTransaction.toString('base64')

    // Insert into database: reference, amount

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message: "Thanks for use the ???? Protocol!",
    })
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'error creating transaction', })
    return
  }
}