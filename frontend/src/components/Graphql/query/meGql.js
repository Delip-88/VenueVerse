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
            user {
                name
            }
        }
        venues {
            id
            name
            description
            pricePerHour
            capacity
            facilities
            availability {
                date
                slots {
                    start
                    end
                }
            }
            reviews {
                id
                rating
                comment
            }
            image {
                public_id
                secure_url
            }
            location {
                street
                province
                zipCode
                city
            }
            bookings {
                id
                date
                totalPrice
                bookingStatus
                paymentStatus
            }
        }
    }
}

`;

export default ME_QUERY;
