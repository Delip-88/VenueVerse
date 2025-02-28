import { gql } from "@apollo/client";

const UPDATE_TO_VENUE_OWNER = gql`
mutation updateToVenueOwner($input: venueOwnerInput!){
    updateToVenueOwner(input: $input){
        message
        success
    }
}
`

export {UPDATE_TO_VENUE_OWNER}