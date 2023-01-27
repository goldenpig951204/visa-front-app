import { Box } from "@mui/material"
import Map from "src/@core/components/google-map";

const ContactUs = () => {
  return (
    <Box>
      <div data-w-id="9d7a0e08-e91c-0a1e-26f8-43972dc7186a" className="section top-section less wf-section">
        <div className="wrapper">
          <div className="page-intro">
            <h1 className="heading-content specialp special2">Contact Us</h1>
            <div className="divider page-intro-divider"></div>
          </div>
        </div>
        <div className="bg-elements">
          <div className="bg-element-1"></div>
          <div className="bg-element-2"></div>
          <div className="bg-element-3"></div>
          <div className="bg-element-4"></div>
        </div>
      </div>
      <div className="section haze oio wf-section">
        <div className="wrapper">
          <div className="b-contact-detail mo">
            <a href="tel:+4402045484994" className="b-contact-button w-inline-block">
              <div className="b-icon-regular w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.2213 15.2682L16.6813 14.9782C16.0713 14.9082 15.4713 15.1182 15.0413 15.5482L13.2013 17.3882C10.3713 15.9482 8.05125 13.6382 6.61125 10.7982L8.46125 8.94819C8.89125 8.51819 9.10125 7.91819 9.03125 7.30819L8.74125 4.78819C8.62125 3.77819 7.77125 3.01819 6.75125 3.01819H5.02125C3.89125 3.01819 2.95125 3.95819 3.02125 5.08819C3.55125 13.6282 10.3813 20.4482 18.9113 20.9782C20.0413 21.0482 20.9813 20.1082 20.9813 18.9782V17.2482C20.9913 16.2382 20.2313 15.3882 19.2213 15.2682Z" fill="currentColor"></path>
              </svg></div>
              <div>+44 (020) 4548 4994</div>
            </a>
            <a href="https://wa.me/447380520373" target="_blank" className="b-contact-button w-inline-block" rel="noreferrer">
              <img src="/images/whats22.svg" alt="" className="footer-contact-icon de" />
              <div>+44 07474 1000 49</div>
            </a>
            <a href="mailto:support@irvisa.online?subject=Hello" className="b-contact-button w-inline-block">
              <img src="/images/email.svg" alt="" className="contact-list-icon" />
              <div>support@irvisa.online</div>
            </a>
            <a href="https://www.google.com/maps/place/Atrac+Travel/@51.52357,-0.1969178,15z/data=!4m2!3m1!1s0x0:0xc19b07c10ff8ac09?sa=X&amp;ved=2ahUKEwiprvXj_qn8AhUxQUEAHdk2AeUQ_BJ6BQjcARAI" className="b-contact-button w-inline-block">
              <div className="b-icon-regular w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.999 2.16132C7.79902 2.16132 3.99902 5.38132 3.99902 10.3613C3.99902 13.5413 6.44902 17.2813 11.339 21.5913C11.719 21.9213 12.289 21.9213 12.669 21.5913C17.549 17.2813 19.999 13.5413 19.999 10.3613C19.999 5.38132 16.199 2.16132 11.999 2.16132ZM11.999 12.1613C10.899 12.1613 9.99902 11.2613 9.99902 10.1613C9.99902 9.06132 10.899 8.16131 11.999 8.16131C13.099 8.16131 13.999 9.06132 13.999 10.1613C13.999 11.2613 13.099 12.1613 11.999 12.1613Z" fill="currentColor"></path>
              </svg></div>
              <div>402 Harrow Rd ,W9 2HU, London, UK</div>
            </a>
          </div>
          <div className="contact-v2-2">
            <div className="contact-v2-map w-widget w-widget-map" data-widget-style="roadmap" data-widget-latlng="51.52357,-0.1969178" aria-label="IrVisa" data-enable-scroll="true" title="IrVisa" data-enable-touch="true" data-widget-zoom="12" data-widget-tooltip="">
              <Map lat={51.52357} lng={-0.1969178} />
            </div>
            <div className="contact-v2-info">
              <h1 className="heading-content specialp special2 tt">24/7 Support</h1>
              <div className="full-width w-form">
                <form id="Contact-Form-1" name="email-form" data-name="Email Form" method="get" className="contact-form">
                  <div id="w-node-_3a948d95-541c-b49e-b42a-28ed5d3fcb09-70b0a6c7">
                    <label htmlFor="Contact-Name" className="label3">Your Name</label>
                    <input type="text" className="input-3 w-input" maxLength="256" name="Contact-Name-2" data-name="Contact Name 2" placeholder="John Smith" id="Contact-Name" />
                  </div>
                  <div id="w-node-_3a948d95-541c-b49e-b42a-28ed5d3fcb0d-70b0a6c7">
                    <label htmlFor="Contact-Email-2" className="label3">Email Address</label>
                    <input type="email" className="input-3 w-input" maxLength="256" name="Contact-Email-2" data-name="Contact Email 2" placeholder="name@example.com" id="Contact-Email-2" required="" />
                  </div>
                  <div>
                    <label htmlFor="Contact-Subject" className="field-label-7">Subject</label>
                    <input type="text" className="input-3 w-input" maxLength="256" name="Contact-Subject" data-name="Contact Subject" placeholder="Enter the subject" id="Contact-Subject" />
                  </div>
                  <div id="w-node-_3a948d95-541c-b49e-b42a-28ed5d3fcb15-70b0a6c7"><label htmlFor="email" className="field-label-8">Message</label><textarea id="field-2" name="field-2" placeholder="How can we help you?" maxLength="5000" required="" data-name="Field 2" className="input-3 text-area w-input"></textarea></div>
                  <input type="submit" value="Submit Message" data-wait="Please wait..." id="w-node-_3a948d95-541c-b49e-b42a-28ed5d3fcb19-70b0a6c7" className="button-blue w-button" />
                </form>
                <div className="form-success-3 w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="form-error-3 w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

ContactUs.guestGuard = true;

export default ContactUs;
