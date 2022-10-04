import { useRouter } from "next/router";
import AdminProjects from "../../components/AdminProjects";
import ComponentButton from "../../components/Elements/ComponentButton";

const PageAdminProjects = () => {
  const router = useRouter()

  return (
    <div className="flex h-full justify-evenly px-4 mt-12">
      {
        router.query.prj &&
        <ComponentButton
          isBack
          routeBack={() => {
            router.back()
          }}
        />
      }
      <AdminProjects />
    </div>
  );
};

export default PageAdminProjects;
