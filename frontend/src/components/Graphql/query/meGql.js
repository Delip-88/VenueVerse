import { gql } from "@apollo/client";

export const ME_QUERY = gql`
query Me {
    me {
        id
        name
        email
        role
        esewaId
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
                id
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
                user {
                    name
                }
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
                user {
                    name
                }
            }
        }
        profileImg {
            public_id
            secure_url
        }
        legalDocImg {
            public_id
            secure_url
        }
        address
        phone
    }
}


`;


export const MY_VENUES= gql`
query MyVenues {
    myVenues {
        id
        name
        description
        pricePerHour
        capacity
        facilities
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
            user {
                name
            }
            venue{
                id
            }
        }
        location {
            street
            province
            zipCode
            city
        }
        image {
            public_id
            secure_url
        }
    }
}


`