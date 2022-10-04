import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
const Example = () => {

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()
    useEffect(() => {
        if (!connection || !publicKey) return
    }, [connection, publicKey])

    return (
        <div className='flex'>
            <WalletMultiButton />
            <div className='p-3'>
                {(!connection || !publicKey) ? (
                    <h2>usuario no conectado a solana</h2>
                ) : (
                    <h2>{publicKey.toBase58()}</h2>
                )}
            </div>
        </div>
    )
}

export default Example
