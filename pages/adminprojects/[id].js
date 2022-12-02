import { useRouter } from "next/router";
import AdminProjects from "../../components/AdminProjects";
import ComponentButton from "../../components/Elements/ComponentButton";

const PageAdminProjects = () => {
  const router = useRouter()

  return (
    <>
    <div className="mt-8">
      {
        router.query.id &&
        <ComponentButton
          isBack
          routeBack={() => router.back()}
        />
      }
      </div>
      <div className="flex h-full justify-evenly px-4 mt-8 w-8/12">
      <AdminProjects />
     </div>
    </>
  );
};

export default PageAdminProjects;
