import Head from "next/head"
import { AuthProvider } from "../context/auth";
import Layout from "../components/Layout";
import { NotiProvider } from "../context/notification";
import { DollarProvider } from "../context/dollarquote";
import { RouteGuard } from "../components/RoutGuard";
import { HostProvider } from "../context/host";
import { BalanceProvider } from "../context/contextBalance";
import "../styles/globals.css";
import { RulesProvider } from "../context/rulesApp";
import WalletContextProvider from "../context/WalletContext";
import { PopUpProvider } from "../components/PopUp";

const MyApp = ({ Component, pageProps }) => {

  return (

    <WalletContextProvider>
      <AuthProvider>
        <RulesProvider>
          <BalanceProvider>
            <NotiProvider>
              <DollarProvider>
                <HostProvider>
                  <RouteGuard>
                    {/* <PopUpProvider> */}
                      <Layout>
                        <Head>
                          <title>Mate</title>
                        </Head>
                        <Component {...pageProps} />
                      </Layout>
                    {/* </PopUpProvider> */}
                  </RouteGuard>
                </HostProvider>
              </DollarProvider>
            </NotiProvider>
          </BalanceProvider>
        </RulesProvider>
      </AuthProvider>
    </WalletContextProvider>
  )


};

export default MyApp;
