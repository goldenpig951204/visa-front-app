import { Box } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import ScrollSpy from 'react-scrollspy-navigation';

const Header = () => {
  const [showTopAlert, setShowTopAlert] = useState(true);

  const scrollToTop = () => {
    const anchor = document.querySelector('body')
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Box>
      <div className="preloader">
        <div className="loading-info">
          <img src="/images/circles-menu-1_1circles-menu-1.gif" alt="" className="loading-icon" />
          <div className="loading-text">Loading...</div>
        </div>
      </div>
      <div className="back-to-top">
        <div id="Top" className="top"></div>
        <button onClick={scrollToTop} className="top-button w-inline-block"></button>
      </div>
      {
        showTopAlert && (
          <div className="top-bar">
            <div className="wrapper">
              <div className="top-message-content">
                <div className="badge-banner">
                  <div>NEW</div>
                </div>
                <div className="top-bar-text">Now you can book your IranAir ticket directly from here</div>
                <ScrollSpy offsetTop={-150}>
                  <Link href="#ApplyNow" data-w-id="8d4e2f94-352a-f2a8-c10e-e863cfda16a2" aria-current="page" className="message-link w-inline-block w--current" ref={React.createRef()}>
                    <div className="text-block-16">Book Now</div>
                    <div className="link-arrow small-white"></div>
                  </Link>
                  <Link href="/home"></Link>
                </ScrollSpy>
                <div className="top-bar-close" onClick={() => setShowTopAlert(false)}></div>
              </div>
            </div>
          </div>
        )
      }
      <div data-collapse="medium" data-animation="default" data-duration="400" data-w-id="3e665832-e661-9678-7e97-efacb32f4091" data-easing="ease" data-easing2="ease" role="banner" className="nav-bar w-nav">
        <div className="wrapper nav-bar-wrapper">
          <a href="index.html" aria-current="page" className="brand w-nav-brand w--current">
            <img src="/images/Group-88.svg" alt="" className="logo" />
            <div className="logo-text">Jules</div>
          </a>
          <div className="navigation">
            <nav role="navigation" className="nav-menu w-nav-menu">
              <ScrollSpy offsetTop={-150}>
                <Link href="/home" aria-current="page" className="nav-link w-nav-link w--current">Home</Link>
                <Link href="/faq" className="nav-link w-nav-link">FAQs</Link>
                <Link href="#Our-Process" className="nav-link w-nav-link" ref={React.createRef()}>Our Process</Link>
                <Link href="/contact-us" className="nav-link w-nav-link">Contact Us</Link>
              </ScrollSpy>
            </nav>
            <div className="nav-right">
              <div className="w-layout-grid nav-buttons">
                <ScrollSpy offsetTop={-150}>
                  <Link href="#ApplyNow" className="button nav-button apply w-button" ref={React.createRef()}>Apply Now</Link>
                  <Link href="/track-application" className="button nav-button w-button">Track Your Application</Link>
                </ScrollSpy>
              </div>
            </div>
            <div className="nav-search">
              <form action="/search" className="nav-search-form w-form">
                <img src="/images/search-dark.svg" alt="" className="big-form-icon" />
                <input type="search" className="form-big-input w-input" autoFocus={true} maxLength="256" name="query" placeholder="What are you looking for?" id="search" required="" />
                <input type="submit" value="Search" className="big-form-button w-button" />
              </form>
              <div data-w-id="9674a5c1-eed1-a2b0-d17d-9572e8f7b46a" className="popup-bg-overlay">
                <div className="modal-close-button"></div>
              </div>
            </div>
            <div className="menu-button w-clearfix w-nav-button">
              <div className="menu-icon">
                <div className="menu-icon-line-top"></div>
                <div className="menu-icon-line-middle"></div>
                <div className="menu-icon-line-bottom"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Header;
