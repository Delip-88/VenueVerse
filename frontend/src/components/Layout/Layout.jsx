import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../../pages/Home/Headers/Header'
import Footer from '../../pages/Home/Headers/Footer'

const Layout = () => {
  return (
    <>
    <Header/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default Layout
