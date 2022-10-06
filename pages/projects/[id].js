import { useRouter } from "next/router";
import ComponentButton from "../../components/Elements/ComponentButton";
import CallProject from "../../components/CallProject";

// import styles from "./projectid.module.scss";

const PageHomeProjects = () => {
  const router = useRouter();
  const { id } = router?.query;
  console.log(router)
  return (
    <div className="flex justify-evenly w-full h-min">
      <ComponentButton
        isBack
        routeBack={() => {
          router.back();
        }}
      />
      <CallProject selected={id} />
    </div>
  );
};

export default PageHomeProjects;
