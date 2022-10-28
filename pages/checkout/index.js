
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, Transaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
// (TS) import { MakeTransactionInputData, MakeTransactionOutputData } from "./api/makeTransaction";
import { findTransactionSignature, FindTransactionSignatureError } from "@solana/pay";

export default function Checkout() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // State to hold API response fields
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState(null);

  // Generate the unique reference which will be used for this transaction
  const reference = useMemo(() => Keypair.generate().publicKey, []);

  // Use our API to fetch the transaction for the selected items
  async function getTransaction() {
    if (!publicKey) {
      return;
    }

    const body = {
      account: publicKey.toString(),
    }

    const amount = 1
    const projectPublicKey = "CUtKCTar8gb5VYCDWbX5yFMVrhbnod9aCNf4cfhD2qPK"
    const payerPublicKey = "CUtKCTar8gb5VYCDWbX5yFMVrhbnod9aCNf4cfhD2qPK"

    const response = await fetch(`/api/solana/makeTransaction?amount=${amount}&projectPublicKey=${projectPublicKey}&payerPublicKey=${payerPublicKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })

    const json = await response.json()

    if (response.status !== 200) {
      console.error(json);
      return;
    }

    // Deserialize the transaction from the response
    const transaction = Transaction.from(Buffer.from(json.transaction, 'base64'));
    setTransaction(transaction);
    setMessage(json.message);
    console.log(transaction);
  }

  useEffect(() => {
    getTransaction()
  }, [publicKey])

  // Send the fetched transaction to the connected wallet
  async function trySendTransaction() {
    if (!transaction) {
      return;
    }
    try {
      await sendTransaction(transaction, connection)
    } catch (e) {
      console.error(e)
    }
  }

  // Send the transaction once it's fetched
  useEffect(() => {
    trySendTransaction()
  }, [transaction])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findTransactionSignature(connection, reference)
        console.log("success!", signatureInfo)
      } catch (e) {
        console.error('Unknown error', e)
      }
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!publicKey) {
    return (
      <div className='flex flex-col gap-8 items-center'>

                  <WalletMultiButton>Connect Wallet</WalletMultiButton>


        <p>You need to connect your wallet to make transactions</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8 items-center'>

                <WalletMultiButton>Connect Wallet</WalletMultiButton>


      {message ?
        <p>{message} Please approve the transaction using your wallet</p> :
        <p>Creating transaction...</p>
      }
    </div>
  )
}