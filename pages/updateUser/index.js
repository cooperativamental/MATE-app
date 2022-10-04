import UpdateUser from "../../components/UserAuth/UpdateUser";
import { useRouter } from "next/router";
import ComponentButton from "../../components/Elements/ComponentButton";

const PageUpdateUser = () => {
  const router = useRouter();
  return (
    <div className="flex justify-evenly overflow-y-auto scrollbar w-full h-[calc(100%_-_3rem)] mt-4 px-4">
      <ComponentButton isBack routeBack={() => router.back()} />
      <UpdateUser />
    </div>
  );
};

export default PageUpdateUser;
