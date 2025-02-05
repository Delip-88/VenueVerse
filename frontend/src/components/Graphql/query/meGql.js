import { gql } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
        id
        name
        email
        role
        verified
        verificationToken
        profileImg {
            public_id
            secure_url
        }
        legalDocImg {
            public_id
            secure_url
        }
        verificationTokenExpiresAt
        esewaId
        location {
            street
            province
            zipCode
            city
        }
    }
}

`;

export default ME_QUERY;
