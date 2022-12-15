import firestoreApp from "../../../firebase/admin"

const admin = (req, res) => {
    const { pda, status } = JSON.parse(req.body)
    firestoreApp.ref("projects").orderByChild("treasuryKey").equalTo(pda).get()
        .then((res) => {
            firestoreApp.ref(`projects/${Object.keys(res.val())}`)
            .update({
                status: status
            })
        })
}

export default admin