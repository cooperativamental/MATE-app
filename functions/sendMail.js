export const sendEmail = async (
  { from, to, subject, text, redirect }
  ) => {
    try {
      fetch("/api/sendmail", 
      {
        method: "POST",
        body: JSON.stringify({
          from: { ...from },
          to: { name: to.name ,email: to.email },
          subject: subject,
          text: text,
          redirect: redirect
        }),
        headers: {
          "Content-Type": "json",
        },
        contentType: "application/json"
      }
      )
    } catch (error) {
      console.log(error)
    }

}