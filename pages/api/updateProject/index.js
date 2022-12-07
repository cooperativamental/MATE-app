import firestoreApp from "../../../firebase/admin"

const admin = (req, res) => {
    const { pda } = JSON.parse(req.body)
    console.log(pda)
    firestoreApp.ref("projects").orderByChild("treasuryKey").equalTo(pda).get()
        .then((res) => {
            console.log(res)
            firestoreApp.ref(`projects/${Object.keys(res.val())}`)
            .update({
                status: "PA"
            })
        })
}

export default admin