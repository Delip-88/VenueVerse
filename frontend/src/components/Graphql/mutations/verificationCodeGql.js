import { gql } from "@apollo/client";

const VERIFICATION_CODE= gql`
mutation verfyuser($email: String!,$code: String!){
  verifyUser(email: $email,code: $code){
    token
  }
}
`

export default VERIFICATION_CODE