import Image from 'next/image'
import { useState } from 'react'


import styles from './imageInvoice.module.scss'

const ImageProject = ({ file, url }) => {
  const [preview, setPreview] = useState(false)

  return (
    <>
      {
        !preview &&
        <h4>{file.file.name}</h4>

      }
    </>
  )
}

export default ImageProject