import ResetPass from "../../components/UserAuth/ResetPass";

import { useRouter } from "next/router";

import styles from "./resetpass.module.scss";
import ComponentButton from "../../components/Elements/ComponentButton"

const PageResetPass = () => {
  const router = useRouter();

  return (
    <>
      <ComponentButton
        isBack
        buttonStyle="fixed top-8 left-5 md:left-20"
        routeBack={() => {
          router.push({
            pathname: "/login",
          });
        }}
      />
      <div className="fixed top-1/4 md:1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex gap-8">
        <ResetPass />
      </div>
    </>
  );
};

export default PageResetPass;
