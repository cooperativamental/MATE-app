import { useRouter } from "next/router";
import ComponentButton from "../../components/Elements/ComponentButton";
import CallProject from "../../components/CallProject";

// import styles from "./projectid.module.scss";

const PageHomeProjects = () => {
  const router = useRouter();
  const { id } = router?.query;
  return (
    <>
      <div className="mt-8">
        <ComponentButton
          isBack
          routeBack={() => router.back()}
        />
      </div>
      <div className="flex h-full justify-evenly px-4 mt-8 w-8/12">

        <CallProject selected={id} />
      </div>

    </>
  );
};

export default PageHomeProjects;
