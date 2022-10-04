import { useRouter } from "next/router"
import Organization from "../../components/Organizations/Organization"


const PageOrganizationID = () => {
    const router = useRouter();
    const { id } = router?.query;

    return (
        <Organization id={id} />
    )
}

export default PageOrganizationID