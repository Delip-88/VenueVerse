import { gql } from "@apollo/client";

const REGISTER_USER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
  register(name:$name, email: $email, password:$password) {
    message,
    success
  }
}
`;

export default REGISTER_USER;
