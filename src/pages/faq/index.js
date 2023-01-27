import { useState } from "react";
import { Link } from "react-scroll";
import { Box, Collapse } from "@mui/material";

const Faq = () => {
  const [faq1Accordions, setFaq1Accordions] = useState([{
    open: true,
    title: "What is a FAQ page?",
    content: "Visa approval will be obtained in 10 working days"
  }, {
    open: false,
    title: "What is VIP Visa Service?",
    content: "It is a service which deliver Visa to your door."
  }, {
    open: false,
    title: "Treatment Visa Validity?",
    content: "45 Days"
  }]);

  const [faq2Accordions, setFaq2Accordions] = useState([{
    open: false,
    title: "Express Visa",
    content: "7 Working Days"
  }, {
    open: false,
    title: "Ordinary Visa",
    content: "14 Woking Days"
  }, {
    open: false,
    title: "Where I can book my Airline Ticket?",
    content: "We recommend booking your Airline ticket through AtracTravel"
  }, {
    open: false,
    title: "Can I extend my Visa",
    content: "Yes, you can"
  }]);

  const [faq3Accordions, setFaq3Accordions] = useState([{
    open: false,
    title: "Can I extend my Visa?",
    content: "You will need to contact Visa Authority in Iran."
  }, {
    open: false,
    title: "What If i don't receive an email?",
    content: "If you do not receive SMS confirmation or email confirmation please check your email account's Spam folder."
  }, {
    open: false,
    title: "What is passport validity required to obtain a Visa?",
    content: "Passport Validity 6 Months minimum"
  }, {
    open: false,
    title: "How Can I track the progress of my Application?",
    content: "You can track your application through the following link"
  }]);

  const [faq4Accordions, setFaq4Accordions] = useState([{
    open: false,
    title: "Do you have a version for business?",
    content: "Yes we do, Please Contact us through Contact Us page."
  }, {
    open: false,
    title: "Can I get a refund after Submitting my application?",
    content: "We start processing your application instantly, only 24 hours."
  }, {
    open: false,
    title: "What kind of support do you provide?",
    content: "24/7 Support"
  }])

  const updateFaq1Accordion = (id) => {
    setFaq1Accordions(faq1Accordions.map((accordion, idx) => {
      if (idx == id) accordion.open = !accordion.open;

      return accordion;
    }));
  }

  const updateFaq2Accordion = (id) => {
    setFaq2Accordions(faq2Accordions.map((accordion, idx) => {
      if (idx == id) accordion.open = !accordion.open;

      return accordion;
    }));
  }

  const updateFaq3Accordion = (id) => {
    setFaq3Accordions(faq3Accordions.map((accordion, idx) => {
      if (idx == id) accordion.open = !accordion.open;

      return accordion;
    }));
  }

  const updateFaq4Accordion = (id) => {
    setFaq4Accordions(faq4Accordions.map((accordion, idx) => {
      if (idx == id) accordion.open = !accordion.open;

      return accordion;
    }));
  }

  return (
    <Box>
      <div data-w-id="9d7a0e08-e91c-0a1e-26f8-43972dc7186a" className="section top-section less wf-section">
        <div className="wrapper">
          <div className="page-intro">
            <h1 className="heading-content specialp special2">Frequently Asked Questions</h1>
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
      <div className="section haze o kj wf-section">
        <div className="wrapper iu">
          <div className="sidebar-grid">
            <div id="w-node-bdc693aa-93d6-f004-b043-32061db55d6a-6c7d63dd" className="sidebar sticky">
              <div className="sidebar-faq-links">
                <Link to="FAQ-1" activeClass="w--current" spy={true} className="faq-nav-link" smooth={true}>Common Questions</Link>
                <Link to="FAQ-2" activeClass="w--current" spy={true} className="faq-nav-link" smooth={true}>Visa Processing Time</Link>
                <Link to="FAQ-3" activeClass="w--current" spy={true} className="faq-nav-link" smooth={true}>Extending Visa</Link>
                <Link to="FAQ-4" activeClass="w--current" spy={true} className="faq-nav-link" smooth={true}>Authorisation Code</Link>
              </div>
            </div>
            <div id="w-node-bdc693aa-93d6-f004-b043-32061db55d0c-6c7d63dd">
              <div id="FAQ-1" className="faq-block first">
                <div className="intro left margin-bottom">
                  <h2 className="faq-block-heading"><span className="text-color-2">01.</span> Common Questions</h2>
                </div>
                {
                  faq1Accordions.map((faq1Accordion, idx) => (
                    <div key={idx} className="accordion-card">
                      <div className="accordion-header" onClick={() => updateFaq1Accordion(idx)}>
                        <h5 className="accordion-heading">{faq1Accordion.title}</h5>
                        <div className={faq1Accordion.open ? 'accordion-arrow is-open' : 'accordion-arrow'}></div>
                      </div>
                      <Collapse in={faq1Accordion.open}>
                        <div data-ix="new-interaction" className="accordion-info">
                          <div className="accordion-text">{faq1Accordion.content}<br /></div>
                        </div>
                      </Collapse>
                    </div>
                  ))
                }
              </div>
              <div id="FAQ-2" className="faq-block">
                <div className="intro left margin-bottom">
                  <h2 className="faq-block-heading"><span className="text-color-2">02.</span> Visa Processing Time</h2>
                </div>
                {
                  faq2Accordions.map((faq2Accordion, idx) => (
                    <div key={idx} className="accordion-card">
                      <div className="accordion-header" onClick={() => updateFaq2Accordion(idx)}>
                        <h5 className="accordion-heading">{faq2Accordion.title}</h5>
                        <div className={faq2Accordion.open ? 'accordion-arrow is-open' : 'accordion-arrow'}></div>
                      </div>
                      <Collapse in={faq2Accordion.open}>
                        <div data-ix="new-interaction" className="accordion-info">
                          <div className="accordion-text">{faq2Accordion.content}<br /></div>
                        </div>
                      </Collapse>
                    </div>
                  ))
                }
              </div>
              <div id="FAQ-3" className="faq-block">
                <div className="intro left margin-bottom">
                  <h2 className="faq-block-heading"><span className="text-color-2">03.</span> Extending Visa</h2>
                </div>
                {
                  faq3Accordions.map((accordion, idx) => (
                    <div key={idx} className="accordion-card">
                      <div className="accordion-header" onClick={() => updateFaq3Accordion(idx)}>
                        <h5 className="accordion-heading">{accordion.title}</h5>
                        <div className={accordion.open ? 'accordion-arrow is-open' : 'accordion-arrow'}></div>
                      </div>
                      <Collapse in={accordion.open}>
                        <div data-ix="new-interaction" className="accordion-info">
                          <div className="accordion-text">{accordion.content}<br /></div>
                        </div>
                      </Collapse>
                    </div>
                  ))
                }
              </div>
              <div id="FAQ-4" className="faq-block">
                <div className="intro left margin-bottom">
                  <h2 className="faq-block-heading"><span className="text-color-2">04.</span> Authorisation Code</h2>
                </div>
                {
                  faq4Accordions.map((accordion, idx) => (
                    <div key={idx} className="accordion-card">
                      <div className="accordion-header" onClick={() => updateFaq4Accordion(idx)}>
                        <h5 className="accordion-heading">{accordion.title}</h5>
                        <div className={accordion.open ? 'accordion-arrow is-open' : 'accordion-arrow'}></div>
                      </div>
                      <Collapse in={accordion.open}>
                        <div data-ix="new-interaction" className="accordion-info">
                          <div className="accordion-text">{accordion.content}<br /></div>
                        </div>
                      </Collapse>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

Faq.guestGuard = true;

export default Faq;
