
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as Web3 from "@solana/web3.js";
import * as WalletAdapterWallets from "@solana/wallet-adapter-wallets";
require("@solana/wallet-adapter-react-ui/styles.css");

export default function WalletContextProvider({ children }) {
  const endpoint = process.env.NEXT_PUBLIC_NETWORK ?? "devnet";
  const phantom = new WalletAdapterWallets.PhantomWalletAdapter();
  const solflare = new WalletAdapterWallets.SolflareWalletAdapter();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[phantom, solflare]}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
