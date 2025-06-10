import { gql } from "@apollo/client";

const DELETE_USER = gql`
mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
        message
        success
    }
}
`;

export { DELETE_USER };