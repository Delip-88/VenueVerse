import { gql } from "@apollo/client";

const UPDATE_TO_VENUE_OWNER = gql`
mutation updateToVenueOwner($input: venueOwnerInput!){
    updateToVenueOwner(input: $input){
        message
        success
    }
}
`
const UPDATE_USER_DETAILS = gql`
mutation UpdateUserDetails($input: UserInput!) {
    updateUserDetails(input: $input) {
        success
        message
    }
}

`
export {UPDATE_TO_VENUE_OWNER, UPDATE_USER_DETAILS}