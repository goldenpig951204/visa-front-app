import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Dialog, DialogTitle, IconButton, DialogContent, Grid } from "@mui/material";
import { Link } from "react-scroll";
import countries from "src/@core/utils/countries.json";
import DatePicker from "react-datepicker";
import InputMask from "react-input-mask";
import ImageUploader from "react-image-upload";
import toast from "react-hot-toast";
import Icon from "src/@core/components/icon";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "src/components/CheckoutForm";
import Http from "src/services/Http";
import moment from "moment"
import "react-datepicker/dist/react-datepicker.css"
import "react-image-upload/dist/index.css"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PRIVATE_KEY);

const Home = () => {
  const router = useRouter();

  const [persons, setPersons] = useState([{
    firstName: "",
    lastName: "",
    fatherName: "",
    birthday: new Date(),
    country: "UK",
    phone: "",
    prevNationality: "US",
    email: "",
    visaType: "",
    travelType: "",
    passportNumber: "",
    issuedDate: new Date(),
    expireDate: new Date(),
    personalPhoto: {},
    passportPhoto: {},
    note: ""
  }]);
  const [visaPrices, setVisaPrices] = useState([]);
  const [travelTypes, setTravelTypes] = useState([]);
  const [clientSecret, setClientSecret] = useState("");
  const [application, setApplication] = useState({ amount: 200 })
  const [showCheckout, setShowCheckout] = useState(false);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      borderRadius: '5px',
      spacingUnit: '5px',
      fontSizeBase: '20px'
    },
    rules: {
      '.Label': {
        marginBottom: '10px'
      }
    }
  }
  useEffect(() => {
    const getVisaPrices = async () => {
      let { data } = await Http.get("visa/visa-prices");
      setVisaPrices(data);
      setPersons(persons.map(person => {
        person.visaType = data ? data[0].visaType._id : "";

        return person;
      }));
    }

    const getTravelTypes = async () => {
      let { data } = await Http.get("visa/travel-types");
      setTravelTypes(data);
      setPersons(persons.map(person => {
        person.travelType = data ? data[0]._id : "";

        return person;
      }));
    }
    getVisaPrices();
    getTravelTypes();
  }, []);

  useEffect(() => {
    let id = new URLSearchParams(window.location.search).get("id");
    let clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (!clientSecret) return;
    stripePromise.then(stripe => {
      stripe.retrievePaymentIntent(clientSecret).then(async ({ paymentIntent }) => {
        switch (paymentIntent.status) {
          case "succeeded":
            toast.success("Payment succeeded!");

            let { data } = await Http.post("visa/order", {
              id: id,
              orderNumber: paymentIntent.id
            });

            router.push("/home");
            if (data.status) {
              toast.success(data.msg);
            } else {
              toast.error(data.msg);
            }
            break;
          case 'processing':
            toast.error("Your payment was not successful, please try again.");
            await Http.post("visa/cancel", {
              id: id
            });
            router.push("/home");
          default:
            toast.error("Something went wrong");
            break;
        }
      })
    });
  }, []);


  const addPerson = () => {
    setPersons([...persons, {
      firstName: "",
      lastName: "",
      fatherName: "",
      birthday: new Date(),
      country: "UK",
      phone: "",
      prevNationality: "US",
      email: "",
      visaType: visaPrices[0].visaType._id,
      travelType: travelTypes[0]._id,
      passportNumber: "",
      issuedDate: new Date(),
      expireDate: new Date(),
      personalPhoto: {},
      passportPhoto: {},
      note: ""
    }]);
  }

  const changePersons = (val, id, key, status = true) => {
    setPersons(persons.map((person, idx) => {
      if (id === idx) {
        return { ...person, [key]: status ? val : "" }
      } else {
        return person;
      }
    }));
  }

  const applyApplication = async (ev) => {
    ev.preventDefault();

    let status = true;
    persons.forEach((person, idx) => {
      if (person.firstName === "") {
        toast.error("Please enter your first name.");
        status = false;

        return;
      } else if (person.lastName === "") {
        toast.error("Please enter your last name.");
        status = false;

        return;
      } else if (person.fatherName === "") {
        toast.error("Please enter your father's name.");
        status = false;

        return;
      } else if (person.phone === "") {
        toast.error("Please enter your phone number.");
        status = false;

        return;
      } else if (person.phone.replace(/[^0-9]/g, '').length !== 12) {
        toast.error("The phone number format seems to be incorrect.");
        status = false;

        return;
      } else if (person.prevNationality === "UK") {
        toast.error("Because you have record of british in the previous nationality, you can not continue this application.");
        status = false;

        return;
      } else if (person.email === "") {
        toast.error("Please enter your email address.");
        status = false;

        return;
      } else if (person.passportNumber === "") {
        toast.error("Please enter your passport number.");
        status = false;

        return;
      } else if (moment.duration(moment(person.expireDate).diff(moment(), 'months', true)) < 6) {
        toast.error("Because the expire date of your passport is not enough, you can't continue this application.");
        status = false;

        return;
      } else if (!Object.keys(person.passportPhoto).length) {
        toast.error("Please choose your passport photo.");
        status = false;

        return;
      } else if (!Object.keys(person.personalPhoto).length) {
        toast.error("Please choose your personal photo.");

        return;
      }
    });

    if (status) {
      let formData = new FormData();
      persons.forEach((person, idx) => {
        formData.append('firstName[]', person.firstName);
        formData.append('lastName[]', person.lastName);
        formData.append('fatherName[]', person.fatherName);
        formData.append('birthday[]', moment(person.birthday).format('YYYY-MM-DD'));
        formData.append('country[]', person.country);
        formData.append('phone[]', person.phone);
        formData.append('prevNationality[]', person.prevNationality);
        formData.append('email[]', person.email);
        formData.append('visaType[]', person.visaType);
        formData.append('travelType[]', person.travelType);
        formData.append('passportNumber[]', person.passportNumber);
        formData.append('issuedDate[]', person.issuedDate);
        formData.append('expireDate[]', person.expireDate);
        formData.append('personalPhoto[]', person.personalPhoto.file);
        formData.append('passportPhoto[]', person.passportPhoto.file);
        formData.append('note[]', person.note);
      });

      try {
        let { data } = await Http.post('/visa', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (data.status) {
          setClientSecret(data.clientSecret);
          setApplication(data.application);
          setShowCheckout(true);
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
  }

  return (
    <Box>
      <div className="section hero-v5 hidden wf-section">
        <div className="wrapper">
          <div className="hero-v5-intro">
            <div className="text-label">Jules UI Kit Template</div>
            <h1><span className="heading-thin">Advanced UI Kit Template</span> for Your Business</h1>
            <div className="hero-v5-form w-form">
              <form id="email-form" name="email-form" data-name="Email Form" method="get" className="form-big">
                <input type="email" className="form-big-input w-input" maxLength="256" name="email-2" data-name="Email 2" placeholder="Your email address" id="email-2" required="" />
                <input type="submit" value="Get Invite" data-wait="Please wait..." className="button w-button" />
              </form>
              <div className="form-success dark w-form-done">
                <div>Thank you! Your submission has been received!</div>
              </div>
              <div className="form-error dark w-form-fail">
                <div>Oops! Something went wrong while submitting the form.</div>
              </div>
              <div className="form-info">
                <div>By clicking “Get Invite” button, you agree to our Terms and that you have read our Data Use Policy.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="objects">
          <div className="hero-object-1"><img src="/images/cup.svg" alt="" className="hero-image-1" /></div>
          <div className="hero-object-2"><img src="/images/notebook.svg" alt="" className="hero-image-2" /></div>
          <div className="hero-object-3"><img src="/images/pantone.svg" alt="" className="hero-image-3" /></div>
          <div className="hero-object-4"><img src="/images/paper-clip.svg" alt="" className="hero-image-4" /></div>
          <div className="hero-object-5"><img src="/images/pen.svg" alt="" className="hero-image-5" /></div>
          <div className="hero-object-6"><img src="/images/mouse.svg" alt="" className="hero-image-6" /></div>
          <div className="hero-object-7"><img src="/images/pin.svg" alt="" className="hero-image-7" /></div>
          <div className="hero-object-8"><img src="/images/clip.svg" alt="" className="hero-image-8" /></div>
          <div className="hero-object-9"><img src="/images/clip.svg" alt="" className="hero-image-9" /></div>
        </div>
        <img src="/images/decor-v1.svg" alt="" className="decor-bottom" />
      </div>
      <div className="section haze p wf-section">
        <div className="wrapper-2">
          <div data-w-id="5ba8af1a-3b7b-69e0-9d38-a55a422e88fe" className="intro-2 wide with-padding">
            <h1 className="top1">IRAN Visa <span className="text-span-9">Simplified</span></h1>
            <div className="top-intro">Transform the way you obtain Iran Visa<br /></div>
            <div data-w-id="7ac21e21-d3af-6a3d-4d91-545080b3edc3" className="_2-buttons">
              <Link to="ApplyNow" className="button w-button" spy={true} smooth={true}>Apply Now</Link>
              <a href="iran-visa-track-your-application.html" id="w-node-_7ac21e21-d3af-6a3d-4d91-545080b3edc6-1e7d633e" className="button white w-button">Track Your Application</a>
            </div>
          </div>
        </div><img src="/images/decor-v1.svg" alt="" className="decor-bottom" />
      </div>
      <div className="section haze background tr rf wf-section">
        <div className="wrapper-2">
          <h1 className="heading-content specialp er">How it Actually works? Simple</h1>
          <div className="main-grid-2">
            <div id="w-node-_44848e8a-f8ac-08ba-cd9f-f6a163610776-1e7d633e" className="side-team">
              <div className="side-team-blocks">
                <div id="w-node-_93e52288-aa32-6a40-ba20-ab90a59f0422-1e7d633e" className="team-v2-card team-contact mobn">
                  <a href="#ApplyNow" className="card-button-2 w-inline-block">
                    <div>Apply</div>
                    <div className="card-button-hover"></div>
                  </a>
                  <div className="team-contact-info">
                    <h1 className="heading-content specialp er steps">Apply with Confidence</h1>
                  </div>
                  <a href="https://maps.google.com" className="mini-map w-inline-block">
                    <div><img src="/images/NN1.svg" loading="lazy" width="73" alt="" /></div>
                  </a>
                </div>
              </div>
              <div className="side-team-blocks second">
                <div className="team-v2-card team-contact mobn">
                  <a href="iran-visa-track-your-application.html" className="card-button-2 w-inline-block">
                    <div>Track</div>
                    <div className="card-button-hover"></div>
                  </a>
                  <div className="team-contact-info">
                    <h1 className="heading-content specialp er steps">Track your Application</h1>
                  </div>
                  <a href="https://maps.google.com" target="_blank" className="mini-map w-inline-block" rel="noreferrer">
                    <div><img src="/images/NN2.svg" loading="lazy" width="73" alt="" /></div>
                  </a>
                </div>
              </div>
              <div className="side-team-blocks second third mob">
                <div className="team-v2-card team-contact mobn">
                  <a href="#" className="card-button-2 w-inline-block">
                    <div>IRAN Air Booking</div>
                    <div className="card-button-hover"></div>
                  </a>
                  <div className="team-contact-info">
                    <h1 className="heading-content specialp er steps">Receive Your Visa</h1>
                  </div>
                  <a href="https://maps.google.com" target="_blank" className="mini-map mobn w-inline-block" rel="noreferrer">
                    <div><img src="/images/NN3.svg" loading="lazy" width="73" alt="" /></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="VIsaType" className="section-regular oiu mot">
        <div className="container-large">
          <div className="heading-wrapper duration">
            <h1 className="heading-content specialp">Visa Types</h1>
            <h1 className="heading-content specialp duration">Duration of stay</h1>
          </div>
          <div data-current="Tab 2" data-easing="ease" data-duration-in="300" data-duration-out="100" className="price-tabs w-tabs">
            <div className="price-tab-menu w-tab-menu">
              <a data-w-tab="Tab 1" className="price-tab-link-3 w-inline-block w-tab-link">
                <div className="text-block-12">45 Days</div>
              </a>
              <a data-w-tab="Tab 2" className="price-tab-link-3 w-inline-block w-tab-link w--current">
                <div>30 Days</div>
              </a>
            </div>
            <div className="price-content w-tab-content">
              <div data-w-tab="Tab 1" className="w-tab-pane">
                <div className="w-layout-grid grid-two-column four">
                  <div className="price-card">
                    <div className="badge-primary">
                      <div>authorisation code</div>
                    </div>
                    <div className="price-text">£10<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing-outline w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-_8549eae3-70f3-4e6b-d064-0cb6558d3750-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in <span className="text-span-15">7 Days</span></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Online auto tracking</div>
                        </div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Save travel cost</div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">No need visiting the Consular Section</div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Delivered to your door </div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227293d22681f2859901282_Pricing%20Asset%2001.png" alt="" className="pricing-image-2 hidden" />
                  </div>
                  <div className="price-card-feature">
                    <div className="badge-secondary">
                      <div>Express vip visa<br /><span className="text-span-18">MOST POPULAR</span></div>
                    </div>
                    <div className="price-text-large">£20<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-_8549eae3-70f3-4e6b-d064-0cb6558d3776-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in <span className="text-span-13">7 Days</span></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Save travel cost</div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">No need visiting the Consular Section<br /></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Delivered to your door <br /></div>
                          <div className="badge-beta">
                            <div>New</div>
                          </div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Online auto tracking<br /></div>
                        </div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227297d83230f1c90a4c619_Pricing%20Asset%2002.png" alt="" className="pricing-image-2" />
                  </div>
                  <div className="price-card ii">
                    <div className="badge-primary">
                      <div>Ordinary visa</div>
                    </div>
                    <div className="price-text">£15<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing-outline w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-_8549eae3-70f3-4e6b-d064-0cb6558d37a0-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in <span className="text-span-14">14 Days</span></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Save travel cost</div>
                        </div>
                      </div>
                      <div className="price-feature-line">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">No need visiting the Consular Section<br /></div>
                      </div>
                      <div className="price-feature-line">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Delivered to your door <br /></div>
                        <div className="badge-beta">
                          <div>New</div>
                        </div>
                      </div>
                      <div className="price-feature-line">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Online auto tracking<br /></div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227293d22681f2859901282_Pricing%20Asset%2001.png" alt="" className="pricing-image-2 hidden" />
                  </div>
                </div>
              </div>
              <div data-w-tab="Tab 2" className="w-tab-pane w--tab-active">
                <div className="w-layout-grid grid-two-column">
                  <div className="price-card">
                    <div className="badge-primary">
                      <div>AUTHORISATION CODE</div>
                    </div>
                    <div className="price-text">£12<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing-outline w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-e6680799-5803-dd74-5ad3-020ec1ab887f-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in 7 Days</div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Online auto tracking</div>
                        </div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Save travel cost</div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">No need visiting the Consular Section</div>
                      </div>
                      <div className="price-feature-line striked">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Delivered to your door</div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227293d22681f2859901282_Pricing%20Asset%2001.png" alt="" className="pricing-image-2 hidden" />
                  </div>
                  <div className="price-card-feature">
                    <div className="badge-secondary">
                      <div className="text-block-11">express treatment visa<br /><span className="text-span-17">Most Popular</span></div>
                    </div>
                    <div className="price-text-large">£30<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-e6680799-5803-dd74-5ad3-020ec1ab88a3-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in <span className="text-span-16">7 Days</span></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Save travel cost</div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">No need visiting the Consular Section</div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Visa delivered to your door </div>
                          <div className="badge-beta">
                            <div>New</div>
                          </div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Online auto tracking</div>
                        </div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227297d83230f1c90a4c619_Pricing%20Asset%2002.png" alt="" className="pricing-image-2" />
                  </div>
                  <div className="price-card">
                    <div className="badge-primary">
                      <div className="text-block-10">ordinary TREATMENT visa</div>
                    </div>
                    <div className="price-text">£20<span className="price-type"></span></div>
                    <a href="#ApplyNow" className="button-pricing-outline w-inline-block">
                      <div>Get Started</div>
                    </a>
                    <div className="price-wrapper">
                      <div className="w-layout-grid price-feature-grid">
                        <div id="w-node-e6680799-5803-dd74-5ad3-020ec1ab88ca-1e7d633e" className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Issued in <span className="text-span-16">14 Days</span></div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">Save travel cost</div>
                        </div>
                        <div className="price-feature-line">
                          <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg></div>
                          <div className="price-feature">No need visiting the Consular Section</div>
                        </div>
                      </div>
                      <div className="price-feature-line">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Visa delivered to your door </div>
                        <div className="badge-beta">
                          <div>New</div>
                        </div>
                      </div>
                      <div className="price-feature-line">
                        <div className="pricing-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg></div>
                        <div className="price-feature">Online auto tracking</div>
                      </div>
                    </div>
                    <img width="190" loading="lazy" src="https://uploads-ssl.webflow.com/621ec104fe396061affb8664/6227293d22681f2859901282_Pricing%20Asset%2001.png" alt="" className="pricing-image-2 hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="ApplyNow" className="section no-padding ii wf-section">
        <div id="ApplyNow" className="form-section-karma">
          <div className="container-6">
            <div className="div-block-19">
              <div className="heading-wrapper duration">
                <h1 className="heading-content specialp app">Apply Now</h1>
              </div>
            </div>
            <div className="form-block-karma">
              <div className="w-layout-grid form-grid-karma">
                <div className="block-karma">
                  <div>
                    <h2 className="h2-white uu lk">Information Note</h2>
                  </div>
                  <div>
                    <p className="paragraph-karma with">Duration of Stay is 30 Days only</p>
                    <p className="paragraph-karma with">The validity period of your Visa will begin as of the date you enter  Iran</p>
                    <p className="paragraph-karma with">The period of stay cannot exceed the duration stated on the Visa.</p>
                    <p className="paragraph-karma with">If you wish to stay longer, you must apply to local Police Station for a residency permit.</p>
                  </div>
                  <div className="contact-detail-wrap">
                    <a href="#" className="contact-detail w-inline-block">
                      <img src="https://uploads-ssl.webflow.com/5f420aab94eec62a38c6940b/5f432b7e00927e20b7dd6c15_Mail%20Salmon.svg" loading="lazy" alt="" className="contact-icon-karma" />
                      <div>hello@irvisa.online</div>
                    </a>
                  </div>
                </div>
                <div id="w-node-_0d563f8c-ccd2-c88a-481d-4c7e530dd22c-1e7d633e" className="form-content">
                  <div className="step-count-2">Step 1/2</div>
                  <div className="counter-top">
                    <div className="form-circle-2 circle-active"><img src="https://uploads-ssl.webflow.com/608544d59d5398ad1d671e21/6086ae3eb48006822a5049a5_User%20Icon%20White.svg" loading="lazy" width="24" alt="" /></div>
                    <div className="form-text-wrapper active-text-wrapper">
                      <div className="display-small-602">Personal Information</div>
                      <p className="paragraph-form-2">P</p>
                    </div>
                  </div>
                  <h2 className="display-xl-3 i">Please Insert your name exactly as it appears on your passport</h2>
                  <div className="form-block-4 w-form">
                    <form id="application-form" name="email-form" data-name="Application Form" method="get" onSubmit={applyApplication}>
                      {
                        persons.map((person, idx) => (
                          <div key={idx}>
                            <div className="w-layout-grid input-grid-karma">
                              <div className="field-wrap-karma">
                                <label htmlFor="First-Name-3" className="detail-dark">First Name</label>
                                <input
                                  type="text"
                                  className="text-field-karma w-input"
                                  maxLength="256"
                                  name="First-Name"
                                  placeholder="James"
                                  id="First-Name-3"
                                  value={person.firstName}
                                  onChange={ev => changePersons(ev.target.value, idx, 'firstName')}
                                />
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Last-Name" className="detail-dark">Last Name</label>
                                <input
                                  type="text"
                                  className="text-field-karma w-input"
                                  maxLength="256"
                                  name="Last-Name"
                                  placeholder="Smith"
                                  id="Last-Name"
                                  value={person.lastName}
                                  onChange={ev => changePersons(ev.target.value, idx, 'lastName')}
                                />
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Fathers-Name-5" className="detail-dark">Fathers name</label>
                                <input
                                  type="text"
                                  className="text-field-karma w-input"
                                  maxLength="256"
                                  name="Fathers-Name"
                                  placeholder="Insert Father&#x27;s Name"
                                  id="Fathers-Name-5"
                                  value={person.fatherName}
                                  onChange={ev => changePersons(ev.target.value, idx, 'fatherName')}
                                />
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Date-of-Birth-4" className="detail-dark">Date of birth</label>
                                <DatePicker
                                  showYearDropdown
                                  showMonthDropdown
                                  selected={person.birthday}
                                  onChange={birthday => changePersons(birthday, idx, 'birthday')}
                                  placeholderText="DD/MM/YYYY"
                                  id="Date-of-Birth-4"
                                  customInput={
                                    <input
                                      type="text"
                                      className="text-field-karma w-input"
                                      maxLength="256"
                                      name="Date-Of-Birth"
                                      placeholder="DD/MM/YYYY"
                                    />
                                  } />
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Country-3" className="detail-dark">Country</label>
                                <select
                                  className="text-field-karma w-input"
                                  name="Country"
                                  id="Country-3"
                                  value={person.country}
                                  onChange={ev => changePersons(ev.target.value, idx, 'country')}
                                >
                                  {
                                    countries.map((country, idx) => <option key={idx} value={country.abbreviation}>{country.name}</option>)
                                  }
                                </select>
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Phone-Number-3" className="detail-dark">Phone number</label>
                                <InputMask
                                  mask="(+44) 999 999 9999"
                                  maskChar="_"
                                  value={person.phone}
                                  onChange={ev => changePersons(ev.target.value, idx, 'phone')}
                                >
                                  {() => <input
                                    type="tel"
                                    id="Phone-Number-3"
                                    className="text-field-karma w-input"
                                    maxLength="256"
                                    name="Phone-Number"
                                    placeholder="(+44) 831 623 5660"
                                  />}
                                </InputMask>
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Previous-Nationality-5" className="detail-dark">Previous nationality</label>
                                <select
                                  className="text-field-karma w-input"
                                  name="Previous-Nationality"
                                  id="Previous-Nationality-5"
                                  value={person.prevNationality}
                                  onChange={ev => changePersons(ev.target.value, idx, 'prevNationality')}
                                >
                                  {
                                    countries.map((country, idx) => <option key={idx} value={country.abbreviation}>{country.name}</option>)
                                  }
                                </select>
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Email-Address" className="detail-dark-2">Email Address</label>
                                <input
                                  type="email"
                                  className="text-field-karma-2 w-input"
                                  maxLength="256"
                                  name="Email-Address"
                                  placeholder="Enter Your Email Address"
                                  id="Email-Address"
                                  value={person.email}
                                  onChange={ev => changePersons(ev.target.value, idx, 'email')}
                                />
                              </div>
                            </div>
                            <div className="check-wrap-karma">
                              <label htmlFor="Type-of-Visa" className="display-s-600" style={{ marginTop: 10 }}>Type of Visa</label>
                              <select
                                id="Type-of-Visa"
                                name="Type-of-Visa"
                                className="select w-select"
                                value={person.visaType}
                                onChange={ev => changePersons(ev.target.value, idx, 'visaType')}>
                                {
                                  visaPrices.map((visaPrice, idx) => <option key={idx} value={visaPrice.visaType._id}>{visaPrice.visaType.name}</option>)
                                }
                              </select>
                              <div>If you require further details about Type of Visas please click <a href="#VIsaType" className="link-2">here</a>.</div>
                            </div>
                            <div className="counter-top uu">
                              <div className="form-circle-2 circle-active"><img src="/images/Passport_White.svg" loading="lazy" width="24" alt="" /></div>
                              <div className="form-text-wrapper active-text-wrapper">
                                <div className="display-small-602">Passport Details</div>
                                <p className="paragraph-form-2">P</p>
                              </div>
                            </div>
                            <div className="check-wrap-karma">
                              <label htmlFor="Passport_Type" className="display-s-600">Type of Travel Document</label>
                              <select
                                id="Passport-Type-2"
                                name="Passport-Type"
                                className="select iu w-select"
                                value={person.travelType}
                                onChange={ev => changePersons(ev.target.value, idx, 'travelType')}
                              >
                                {
                                  travelTypes.map((travelType, idx) => <option key={idx} value={travelType._id}>{travelType.name}</option>)
                                }
                              </select>
                            </div>
                            <div className="w-layout-grid input-grid-karma r">
                              <div className="field-wrap-karma">
                                <label htmlFor="Passport-Number-4" className="detail-dark">Passport number</label>
                                <input
                                  type="text"
                                  className="text-field-karma w-input"
                                  maxLength="256"
                                  name="Passport-Number"
                                  placeholder="Passport Number"
                                  id="Passport-Number-4"
                                  value={person.passportNumber}
                                  onChange={ev => changePersons(ev.target.value, idx, 'passportNumber')} />
                              </div>
                              <div className="field-wrap-karma">
                                <label htmlFor="Passport-Issue-Date" className="detail-dark">Issue date</label>
                                <DatePicker
                                  showYearDropdown
                                  showMonthDropdown
                                  selected={person.issuedDate}
                                  onChange={issuedDate => changePersons(issuedDate, idx, 'issuedDate')}
                                  id="Passport-Issue-Date"
                                  placeholderText="DD/MM/YYYY"
                                  customInput={
                                    <input
                                      type="text"
                                      className="text-field-karma w-input"
                                      maxLength="256"
                                      name="Passport-Issue-Date"
                                    />
                                  }
                                />
                              </div>
                              <div className="field-wrap-karma" style={{ zIndex: 2 }}>
                                <label htmlFor="Passport-Expire-Date" className="detail-dark">Expire Date</label>
                                <DatePicker
                                  showYearDropdown
                                  showMonthDropdown
                                  selected={person.expireDate}
                                  onChange={expireDate => changePersons(expireDate, idx, 'expireDate')}
                                  id="Passport-Expire-Date"
                                  placeholderText="DD/MM/YYYY"
                                  customInput={
                                    <input
                                      type="text"
                                      className="text-field-karma w-input"
                                      maxLength="256"
                                      name="Passport-Expire-Date"
                                    />
                                  }
                                />
                              </div>
                            </div>
                            <label htmlFor="EXPIRE-DATE-3" className="detail-dark personal">Upload Personal Photo</label>
                            <div className="up4">
                              <ImageUploader
                                className="photoupload"
                                style={{
                                  minWidth: 150,
                                  minHeight: 155,
                                  marginTop: 15,
                                  backgroundColor: '#ffffff',
                                  backgroundImage: 'url(../images/b.svg)',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  backgroundSize: '60px 50px',
                                  border: '2px solid #dce0e5',
                                  borderRadius: 15
                                }}
                                deleteIcon={<Icon icon='mdi:delete-circle' />}
                                uploadIcon={<img src="/images/Upload.svg" width="51" alt="" />}
                                onFileAdded={img => changePersons(img, idx, 'personalPhoto', true)}
                                onFileRemoved={img => changePersons(img, idx, 'personalPhoto', false)}
                              />
                              <label htmlFor="Message-Karma" className="detail-dark jpeg">
                                <span className="text-span-10 t">Drop your image here, or browse</span>
                              </label>
                              <label htmlFor="Message-Karma" className="detail-dark jpeg">
                                <span className="text-span-10 t">(*.jpeg, jpg, png)</span>
                              </label>
                              <label htmlFor="EXPIRE-DATE-4" className="detail-dark upassport">Upload Passport Photo</label>
                              <ImageUploader
                                className="photoupload"
                                style={{
                                  minWidth: 210,
                                  minHeight: 155,
                                  marginTop: 15,
                                  backgroundColor: '#ffffff',
                                  backgroundImage: 'url(../images/SVG.svg)',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  backgroundSize: '58px 90px',
                                  border: '2px solid #dce0e5',
                                  borderRadius: 15
                                }}
                                deleteIcon={<Icon icon='mdi:delete-circle' />}
                                uploadIcon={<img src="/images/Upload.svg" width="51" alt="" />}
                                onFileAdded={img => changePersons(img, idx, 'passportPhoto', true)}
                                onFileRemove={img => changePersons(img, idx, 'passportPhoto', false)}
                              />
                              <label htmlFor="Message-Karma" className="detail-dark jpeg">
                                <span className="text-span-10 t">Drop your image here, or browse</span>
                              </label>
                              <label htmlFor="Message-Karma-2" className="detail-dark jpeg">
                                <span className="text-span-10 t">(*.jpeg, jpg, png)</span>
                              </label>
                            </div>
                            <div className="field-wrap-karma i">
                              <label htmlFor="Notes" className="detail-dark-2 notes">Notes (Optional)</label>
                              <input
                                type="text"
                                className="text-field-karma-2 w-input"
                                maxLength="256"
                                name="Notes"
                                placeholder="If you have any notes please list them here"
                                id="Notes"
                                value={person.value}
                                onChange={ev => changePersons(ev.target.value, idx, 'note')}
                              />
                            </div>
                          </div>
                        ))
                      }
                      <div className="button-wrap-karma">
                        <input
                          type="button"
                          value="+ Add Another Person"
                          data-wait="Processing..."
                          className="submit-button-karma add w-button"
                          onClick={addPerson}
                        />
                        <input type="submit" value="Submit Your Application" data-wait="Processing..." className="submit-button-karma w-button" />
                      </div>
                    </form>
                    <div className="w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wrapper centred"></div>
      </div>
      <div className="section no-padding wf-section">
        <div className="wrapper-2">
          <div className="w-layout-grid main-grid-3">
            <div id="w-node-_901b7b78-e9d1-a8c2-9d85-548ebf896008-1e7d633e" className="w-layout-grid counters-bricks">
              <div className="counter centered">
                <div className="counter-number">150+</div>
                <div className="counter-text">Daily Application Recieved</div>
              </div>
              <div className="counter centered">
                <div className="counter-number">28,425</div>
                <div className="counter-text">Visa Application Processed</div>
              </div>
              <div id="w-node-_901b7b78-e9d1-a8c2-9d85-548ebf896013-1e7d633e" className="counter centered">
                <div className="counter-number">100%</div>
                <div className="counter-text">Approval Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="Our-Process" className="process-section-4">
        <div className="process-container-2">
          <div className="process-title-wrap-4">
            <h1 className="heading-large-2 letsee">Our Process</h1>
          </div>
          <div className="w-layout-grid process-grid-3">
            <img src="/images/A4-Pre-Application-System-for-Iraq.jpg" loading="lazy" id="w-node-_89b623b7-0292-0313-ce6c-711f27462639-1e7d633e" sizes="(max-width: 1279px) 94vw, 1080px" srcSet="/images/A4-Pre-Application-System-for-Iraq-p-500.jpg 500w, /images/A4-Pre-Application-System-for-Iraq-p-800.jpg 800w, /images/A4-Pre-Application-System-for-Iraq-p-1080.jpg 1080w, /images/A4-Pre-Application-System-for-Iraq.jpg 1280w" alt="" className="placeholder-image" />
            <div className="w-layout-grid step-grid">
              <div className="empty-div"></div>
              <div id="w-node-_89b623b7-0292-0313-ce6c-711f2746263c-1e7d633e" className="step-number">Start</div>
              <div className="line-wrap">
                <div className="check-wrap">
                  <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7ebda194f9bb46de4a_Check.svg" loading="lazy" alt="" />
                </div>
                <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7e5698e54f0c040460_Line.svg" loading="lazy" alt="" className="line" />
              </div>
              <div className="content-wrap">
                <div className="step-title-wrapper">
                  <h4 className="large-title">Apply online</h4>
                  <p className="text-detail">You can apply online by entering all required fields <a href="#ApplyNow"><strong className="bold-text-6">here</strong></a>
                  </p>
                </div>
                <div className="step-number">once applied</div>
              </div>
              <div className="line-wrap">
                <div className="check-wrap">
                  <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7ebda194f9bb46de4a_Check.svg" loading="lazy" alt="" />
                </div>
                <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7e5698e54f0c040460_Line.svg" loading="lazy" alt="" className="line" />
              </div>
              <div className="content-wrap">
                <div className="step-title-wrapper">
                  <h4 className="large-title">Receiving Confirmation</h4>
                  <p className="text-detail">You will receive a confirmation with tracking number through:<br />1- SMS <br />2- Email<br /></p>
                </div>
                <div className="step-number">confirmation details</div>
              </div>
              <div className="line-wrap">
                <div className="check-wrap">
                  <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7ebda194f9bb46de4a_Check.svg" loading="lazy" alt="" />
                </div>
                <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7e5698e54f0c040460_Line.svg" loading="lazy" alt="" className="line" />
              </div>
              <div className="content-wrap-2">
                <div className="step-title-wrapper">
                  <h4 className="large-title">Tracking Number</h4>
                  <p className="text-detail">You can use tracking number provided in Email/SMS confirmation to track the progress of your application <a href="#"><strong className="bold-text-5">here </strong></a>
                  </p>
                </div>
                <div className="step-number">receiving Approval </div>
              </div>
              <div className="line-wrap">
                <div className="check-wrap">
                  <img src="https://uploads-ssl.webflow.com/6106180d31d33717a80a43d1/61061a7ebda194f9bb46de4a_Check.svg" loading="lazy" alt="" />
                </div>
              </div>
              <div className="content-wrap-2">
                <div className="step-title-wrapper">
                  <h4 className="large-title">Receiving Your Visa</h4>
                  <p className="text-detail">Once your application is processed you will receive a confirmation with details through:<br />1-SMS<br />2-Email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section with-no wf-section">
        <div className="wrapper-2">
          <div className="faq-box">
            <div className="faq-box-info">
              <div className="text-label-2">Answers to</div>
              <h2 className="hand">Frequently Asked Questions</h2>
              <p className="text-grey-2">If you couldn&#x27;t find the answer here please visit or complete FAQs page</p>
              <a href="faq.html" className="button-2 w-button">Questions &amp; Answers</a>
              <a href="contactus.html" className="button-2 with w-button">Contact Us</a>
            </div>
            <div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">From where I can apply?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">You can apply from anywhere</div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">How long it takes to process the Visa Application?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">Visa approval will be obtained in 10 working days</div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">What is VIP Visa service?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">It is a service which deliver Visa to your door.</div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">Where I can book Iran Air Ticket?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">You can book your IRAN Air ticket from here</div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">What is Authorisation Code?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">Authorisation code is a code to be recieved from Ministry of foreign affairs which you can take it to nearest Iran Embassy or Iran Consular section to obtain your Visa</div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header-2">
                  <h4 className="accordion-heading-2">Can I extend my Visa?</h4>
                  <div className="accordion-plus">
                    <div className="plus-line-h"></div>
                    <div className="plus-line-v"></div>
                  </div>
                </div>
                <div data-ix="new-interaction" className="accordion-info-2">
                  <div className="accordion-text-2">You will need to contact Visa Authority in Iran.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog fullWidth={true} maxWidth={'md'} onClose={() => setShowCheckout(false)} open={showCheckout}>
        <DialogTitle style={{ paddingLeft: 30, paddingRight: 30, fontSize: 30 }}>
          Payment Details
          <IconButton
            aria-label="close"
            onClick={() => setShowCheckout(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}>
          <Grid container spacing={8}>
            <Grid item md={6}>
              {
                clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                    <CheckoutForm id={application._id} />
                  </Elements>
                )
              }
            </Grid>
            <Grid item md={6}>
              <div style={{ height: '100%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: 40, textAlign: 'center' }}>Application price</h1>
                <h2 style={{ fontSize: 50, textAlign: 'center' }}>${application.amount}</h2>
                <div className="field-wrap-karma s" style={{ marginTop: 20 }}><img src="/images/lock2.svg" loading="lazy" width="26" alt="" className="contact-icon-karma uu" /><label htmlFor="Message-Karma" className="detail-dark"><span className="text-span-10">Encrypted and Secure Payments</span></label></div>
                <div className="field-wrap-karma s">
                  <div className="pricing-icon pricing-blue-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.334 2.75024H7.665C4.644 2.75024 2.75 4.88924 2.75 7.91624V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91624C21.25 4.88924 19.364 2.75024 16.334 2.75024Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg></div><label htmlFor="Message-Karma-2" className="detail-dark"><span className="text-span-10 t">By checking out you agree with our <strong>Terms of Service</strong>. We will process your personal data for the fulfillment of your order and other purposes as per our <strong>Privacy Policy</strong>.</span></label>
                </div>
              </div>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

Home.guestGuard = true;

export default Home
