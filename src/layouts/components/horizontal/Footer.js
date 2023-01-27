import { Box } from "@mui/material";
import React from "react";
import Link from "next/link";
import ScrollSpy from 'react-scrollspy-navigation';

const Footer = () => {
  return (
    <Box>
      <div className="footer wf-section">
        <div className="wrapper">
          <div className="w-layout-grid footer-grid">
            <div id="w-node-_1f1d125a-d01b-7410-9598-eb77fd44e901-d1822f9d" className="footer-top">
              <ScrollSpy offsetTop={-100}>
                <Link href="/home" className="footer-brand w-nav-brand">
                  <img src="/images/Group-90white.svg" alt="" className="logo" />
                  <div className="logo-description">Powered by AtracTravel</div>
                </Link>
                <Link href="#ApplyNow" className="button color-2 color4 w-button" ref={React.createRef()}>Book Your Visa</Link>
              </ScrollSpy>
            </div>
            <div id="w-node-_4cccd955-1110-6266-a922-4b5ac4677b9d-d1822f9d" className="footer-v1-column">
              <Link href="/home" aria-current="page" className="footer-link w--current">Home</Link>
              <Link href="/faq" className="footer-link">FAQs</Link>
              <Link href="/track-application" className="footer-link">Track Your Application</Link>
              <Link href="/contact-us" className="footer-link">Contact Us</Link>
            </div>
            <div id="w-node-_63f85f00-be05-c081-0d96-9fc6d1822fb9-d1822f9d" className="footer-v1-column">
              <Link href="/contact-us" className="footer-link">Business</Link>
              <Link href="/service-agreement" className="footer-link">Services Agreement</Link>
              <Link href="/privacy-notice" className="footer-link">Privacy Notice</Link>
              <Link href="/cookie-policy" className="footer-link">Cookie Policy</Link>
            </div>
            <div id="w-node-ecf6cc58-22d3-8ae1-4b7e-213b09e4b74f-d1822f9d" className="footer-v1-column">
              <div className="footer-link footer-contact">
                <img src="/images/mail-white.svg" alt="" className="footer-contact-icon" />
                <div>info@irvisa.online</div>
              </div>
              <div className="footer-link footer-contact">
                <img src="/images/phone-call-white.svg" alt="" className="footer-contact-icon" />
                <div>+44 (020) 4548 4994</div>
              </div>
              <a href="https://wa.me/447380520373" className="w-inline-block">
                <div className="footer-link footer-contact">
                  <img src="/images/whats.svg" alt="" className="footer-contact-icon" />
                  <div>+44 07474 1000 49</div>
                </div>
              </a>
            </div>
            <div id="w-node-_63f85f00-be05-c081-0d96-9fc6d1822fc6-d1822f9d" className="footer-v1-column onlythis">
              <h4 className="footer-heading">Subscribe for Updates</h4>
              <div className="footer-v1-form w-form">
                <form id="email-form" name="email-form" data-name="Email Form" method="get" className="form-small">
                  <input type="email" className="form-small-input w-input" maxLength="256" name="email-2" data-name="Email 2" placeholder="Your email address" id="Footer-Email" required="" />
                  <input type="submit" value=" " data-wait="..." className="button small-form-arrow-button w-button" />
                </form>
                <div className="form-success dark w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="form-error dark w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
                <div className="form-info">
                  <div>No Spam</div>
                  <div className="dot-divider white"></div>
                  <div>Unsubscribe Anytime</div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <div className="social-icons-small">
                <a href="https://twitter.com" target="_blank" className="social-link-small w-inline-block" rel="noreferrer">
                  <img src="/images/twitter-white.svg" width="Auto" alt="" className="social-icon-small" />
                </a>
                <a href="https://facebook.com" target="_blank" className="social-link-small w-inline-block" rel="noreferrer">
                  <img src="/images/facebook-white.svg" alt="" className="social-icon-small" />
                </a>
                <a href="https://instagram.com" target="_blank" className="social-link-small w-inline-block" rel="noreferrer">
                  <img src="/images/instagram-white.svg" alt="" className="social-icon-small" />
                </a>
              </div>
            </div>
            <div className="footer-bottom-right">
              <div className="dot-divider white"></div>
              <div>Powered by <a href="https://beeshive.online" target="_blank" className="link-white" rel="noreferrer">BeesHive</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Footer;
