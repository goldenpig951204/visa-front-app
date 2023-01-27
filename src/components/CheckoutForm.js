import { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { LoadingButton } from "@mui/lab";
import Icon from 'src/@core/components/icon'
import { toast } from "react-hot-toast";

const CheckoutForm = ({ id }) => {
  console.log("CHECK_OUT====>", id);
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const checkout = async ev => {
    ev.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `http://localhost:3000/home?id=${id}`
      }
    });
    if (error.type === "card_error" || error.type === "validation_error") {
      toast.error(error.message)
    }

    setIsLoading(false);
  }

  return (
    <form id="payment-form" onSubmit={checkout}>
      <PaymentElement id="payment-element" />
      <LoadingButton
        disabled={isLoading || !stripe || !elements}
        style={{ width: '100%', padding: 15, marginTop: 20 }}
        size="large"
        variant="contained"
        color="primary"
        loading={isLoading}
        loadingPosition="start"
        startIcon={<Icon icon="mui:payment" />}
        type="submit">Pay Now</LoadingButton>
    </form>
  )
}

export default CheckoutForm
