// pages/shop/checkout.tsx
import { createQR, encodeURL, EncodeURLComponents, findTransactionSignature, FindTransactionSignatureError, validateTransactionSignature, ValidateTransactionSignatureError } from "@solana/pay";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useRef } from "react";
import { PublicKey } from "@solana/web3.js"
import { get, getDatabase, ref } from "firebase/database";


export default function Checkout() {
  const qrRef = useRef(null)
  const db = getDatabase()
  const router = useRouter()
  const [amount, setAmount] = useState()
  const [projectPublicKey, setProjectPublicKey] = useState()

  useEffect(() => {
    router.query.prjID &&
    get(ref(db, `projects/${router.query.prjID}`))
      .then(res => {
        if(res.exists()){
          setProjectPublicKey(res.val().treasuryKey)
          const amount =new BigNumber(res.val().totalBruto)
          setAmount(amount)
          // Solana Pay transfer params
          const urlParams = {
            recipient: new PublicKey(res?.val()?.treasuryKey),
            amount,
            label: "🧉 Protocol",
            message: "Thanks for using the 🧉 Protocol",
          }
  
          // Encode the params into the format shown
          const url = encodeURL(urlParams)
          console.log({ url })
          const qr = createQR(url, 512, 'transparent')
          if (qrRef.current && amount.isGreaterThan(0)) {
            qrRef.current.innerHTML = ''
            qr.append(qrRef.current)
          }
        }
      })
  }, [db, router.query])


  // Unique address that we can listen for payments to
  const reference = useMemo(() => Keypair.generate().publicKey, [])

  // Get a connection to Solana devnet
  const network = WalletAdapterNetwork.Devnet
  const endpoint = clusterApiUrl(network)
  const connection = new Connection(endpoint)


  // new BigNumber(1)
  // // ref to a div where we'll show the QR code
  //  = "CUtKCTar8gb5VYCDWbX5yFMVrhbnod9aCNf4cfhD2qPK"

  // Show the QR code

  // Check every 0.5s if the transaction is completed
  useEffect(() => {
    if (amount) {
      const interval = setInterval(async () => {
        try {
          // Check if there is any transaction for the reference
          const signatureInfo = await findTransactionSignature(connection, reference, {}, 'confirmed')
          // Validate that the transaction has the expected recipient, amount and SPL token
          await validateTransactionSignature(connection, signatureInfo.signature, shopAddress, amount, reference, 'confirmed')
        } catch (e) {
          console.error('Unknown error', e)
        }
      }, 500)
      return () => {
        clearInterval(interval)
      }
    }
  }, [amount])

  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full w-full">

      <p className="text-3xl font-semibold">Amount: ${amount?.toString()}</p>

      {/* div added to display the QR code */}
      <div ref={qrRef} className=" bg-gradient-to-r from-purple-700 to-cyan-500"/>
    </div>
  )
}