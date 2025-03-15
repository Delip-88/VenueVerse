import { gql } from "@apollo/client";

const VENUES = gql`
 query Venues {
    venues {
        id
        name
        description
        basePricePerHour
        capacity
        category
        location {
            street
            province
            zipCode
            city
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
        services {
            serviceId {
                id
                name
                basePricePerHour
            }
            customPricePerHour
        }
    }
}

`;

const VENUE_BY_ID = gql`
 query Venue($id: ID!) {
    venue(id: $id) {
        id
        name
        description
        basePricePerHour
        capacity
        category
        location {
            street
            province
            zipCode
            city
        }
        owner {
            name
            email
            phone
        }
        reviews {
            id
            rating
            comment
            user {
                name
            }
        }
        services {
            customPricePerHour
            serviceId {
                id
                name
                basePricePerHour
                image {
                    public_id
                    secure_url
                }
            }
        }
        image {
            public_id
            secure_url
        }
    }
}

`;

const GET_SERVICES = gql`
query Services {
    services {
        id
        name
        basePricePerHour
        image {
            public_id
            secure_url
        }
    }
}

`


export {VENUE_BY_ID, VENUES, GET_SERVICES}