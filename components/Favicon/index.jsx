import { useEffect, useState } from "react"
import Head from "next/head"
import { useNotification } from '../../context/notification'

const Favicon = () => {
    const [fav, setFavicon] = useState()
    const { notification } = useNotification()
    const [count , setCount] = useState()
    const svg = (num) => {
        return `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="64" height="64">
  <defs> 
    <linearGradient transform="matrix(1 0 0 1 0 0)"  id="1" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop stop-color="#20B038" offset="0%"/>
        <stop stop-color="#60D66A" offset="100%"/>
    </linearGradient>
  </defs>
  <image id="image0" width="68" height="75" x="0" y="0"
href="data:image/png;base64,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" />
  <g transform="matrix(0.052459016 0 0 0.052244898 0 0)">
    <g>
        <circle cx="900" cz="50" cy="900" r="350" />
        <text  transform="matrix(7.96904 0 0 4.70731 -4749.67 -1728.03)" x="${num >= 9 ? '350.92255' : '675.92255'}" y="600.27185" style="fill:cyan;font-weight:bold;background-color:grey;font-family:arial" stroke="red" font-size="120">${num}</text> 
    </g>
  </g>
</svg>`
    }

    const GenereateBlob = (num) => {
        const svgGenerator = svg(num)
        const blob = new Blob(
            [svgGenerator],
            { type: 'image/svg+xml;utf8' }
        )
        const img = URL.createObjectURL(blob)
        setFavicon(img)
    }

    useEffect(() => {
        const count = Object.values(notification).filter(noti => noti.viewed === false)
        setCount(count.length)
        GenereateBlob(count.length)
    }, [notification])

    return (
        <Head>
            <link rel="icon" href={count ? `${fav}` : "/favicon.ico"} src={fav} />
        </Head>
    )
}

export default Favicon