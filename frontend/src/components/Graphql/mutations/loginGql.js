import { gql } from "@apollo/client";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
    }
  }
`;

export default LOGIN_USER;
