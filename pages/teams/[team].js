import { useRouter } from "next/router"
import Team from "../../components/Teams/Team"


const PageTeamID = () => {
    const router = useRouter();
    const { id } = router?.query;

    return (
        <Team id={id} />
    )
}

export default PageTeamID