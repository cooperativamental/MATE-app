import { useRouter } from "next/router"
import Team from "../../components/Teams/Team"


const PageTeamID = () => {
    const router = useRouter();
    const { team } = router?.query;
    console.log(team)
    return (
        <Team id={team} />
    )
}

export default PageTeamID