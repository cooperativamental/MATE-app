
import * as Web3 from "@solana/web3.js"

const createWallet = async (req, res) => {
    try {
        const signer = Web3.Keypair.generate()
        const secretKey= `[${signer.secretKey.toString()}]`
        const publicKey = (await signer).publicKey.toBase58()
        const network = "solana-devnet" 
        res.status(200).send({
            secretKey,
            publicKey,
            network
        })
    } catch (err) {
        res.status(500).send({ err })
    }
}

export default createWallet