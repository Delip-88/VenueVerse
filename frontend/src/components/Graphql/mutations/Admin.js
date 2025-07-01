import { gql } from "@apollo/client";

const DELETE_USER = gql`
mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
        message
        success
    }
}
`;


 const ADD_CATEGORY = gql`
  mutation AddCategory($category: String!) {
    addCategory(category: $category) {
      categories
    }
  }
`;

 const REMOVE_CATEGORY = gql`
  mutation RemoveCategory($category: String!) {
    removeCategory(category: $category) {
      categories
    }
  }
`;

 const EDIT_CATEGORY = gql`
  mutation EditCategory($oldCategory: String!, $newCategory: String!) {
    editCategory(oldCategory: $oldCategory, newCategory: $newCategory) {
      categories
    }
  }
`;

export { DELETE_USER, ADD_CATEGORY, REMOVE_CATEGORY, EDIT_CATEGORY };