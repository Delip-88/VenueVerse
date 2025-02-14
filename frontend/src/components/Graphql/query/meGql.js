import { gql } from "@apollo/client";

const ME_QUERY = gql`
 query Me {
    me {
        id
        name
        email
        role
        esewaId
        verified
        verificationToken
        verificationTokenExpiresAt
        bookings {
            id
            date
            totalPrice
            bookingStatus
            paymentStatus
            timeslots {
                start
                end
            }
            venue {
                name
            }
        }
    }
}



`;

export default ME_QUERY;
