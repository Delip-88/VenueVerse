import { useMutation } from "@apollo/client";
import { useState } from "react";
import { BOOK_VENUE } from "./Graphql/mutations/bookVenueGql";
import {
  GEN_SIGNATURE,
  INITIATE_PAYMENT,
} from "./Graphql/mutations/paymentGql";
import Loader from "../pages/common/Loader";
import { toast } from "react-hot-toast";

const EsewaPaymentForm = ({ venue, date, start, end }) => {
  const [formData, setFormData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [bookVenue, { loading: bookingLoading }] = useMutation(BOOK_VENUE);
  const [initiatePayment, { loading: iLoading }] = useMutation(INITIATE_PAYMENT);
  const [genSignature, { loading: sLoading }] = useMutation(GEN_SIGNATURE);

  if (bookingLoading || iLoading || sLoading) return <Loader />;


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    await toast.promise(
      (async () => {
        try {
          // Step 1: Book the venue
          const bookingRes = await bookVenue({
            variables: { input: { venue, date, start, end } },
          });
  
          const { id: bookingId, totalPrice } = bookingRes.data?.bookVenue;
  
          // Step 2: Initiate Payment
          const initiatePaymentRes = await initiatePayment({
            variables: { bookingId, amount: totalPrice },
          });
  
          const { transactionId } = initiatePaymentRes.data?.initiatePayment;
  
          // Step 3: Generate Signature
          const getSignatureRes = await genSignature({
            variables: {
              total_amount: totalPrice,
              transaction_uuid: transactionId,
              product_code: import.meta.env.VITE_PAYMENT_PRODUCT_CODE,
            },
          });
  
          const { signature, signed_field_names } =
            getSignatureRes.data?.generateSignature;
  
          // Step 4: Prepare Form Data
          const newFormData = {
            amount: totalPrice,
            tax_amount: 0,
            total_amount: totalPrice,
            transaction_uuid: transactionId,
            product_code: import.meta.env.VITE_PAYMENT_PRODUCT_CODE,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: import.meta.env.VITE_PAYMENT_SUCCESS_URL,
            failure_url: import.meta.env.VITE_PAYMENT_FAILURE_URL,
            signed_field_names,
            signature,
          };
  
          setFormData(newFormData);
          console.log("Signed Field Names:", signed_field_names);
          console.log("Signature:", signature);
          console.log("Total Amount:", totalPrice);
          console.log("Transaction UUID:", transactionId);
          console.log("Product Code:", import.meta.env.VITE_PAYMENT_PRODUCT_CODE);
          console.log("Success URL:", import.meta.env.VITE_PAYMENT_SUCCESS_URL);
          console.log("Failure URL:", import.meta.env.VITE_PAYMENT_FAILURE_URL);
  
          // Wait for state update before submitting
          setTimeout(() => {
            document.getElementById("esewa-form").submit();
          }, 100);
        } catch (err) {
          throw new Error(err.message || "Booking failed! Please try again.");
        }
      })(),
      {
        loading: "Processing your booking...",
        success: "Booking successful! Redirecting to payment...",
        error: (err) => err.message, // Show backend error message
      }
    );
  };
  
  return (
    <form
      action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
      method="POST"
      id="esewa-form"
      onSubmit={handleSubmit}
    >
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {formData &&
        Object.keys(formData).map((key) => (
          <div key={key}>
            {key === "total_amount" && <label>Total Amount:</label>}
            <input
              type={key === "total_amount" ? "text" : "hidden"}
              name={key}
              value={formData[key]}
              readOnly
              required
            />
          </div>
        ))}

      <button
        type="submit"
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Proceed to Payment
      </button>
    </form>
  );
};

export default EsewaPaymentForm;
