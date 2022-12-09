import firestoreApp from "../../../firebase/admin"

const admin = (req, res) => {
    const { pda } = JSON.parse(req.body)
    firestoreApp.ref("projects").orderByChild("treasuryKey").equalTo(pda).get()
        .then((res) => {
            firestoreApp.ref(`projects/${Object.keys(res.val())}`)
            .update({
                status: "PAYED"
            })
        })
}

export default admin