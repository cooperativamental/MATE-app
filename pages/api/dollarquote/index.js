const dollarquote = (req, res) => {
    fetch("https://api-dolar-argentina.herokuapp.com/api/dolarblue")
        .then((response) => {
            response.json().then(data => {
                res.status(200).send({ ...data })
            })
        })
        .catch(err => {
            res.status(500).send({ err: err })
        })
}

export default dollarquote