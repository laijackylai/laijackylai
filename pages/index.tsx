import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  useEffect(() => {
    // set website title
    document.title = 'hklai'
    return () => {
    }
  }, [])


  return (
    <div>
      hi there
    </div>
  )
}

export default Home
