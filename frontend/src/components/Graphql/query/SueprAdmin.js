import { gql } from "@apollo/client";

const PENDING_ROLE_REQUESTS = gql`
query PendingVenueOwners {
    pendingVenueOwners {
        id
        name
        email
        role
        esewaId
        phone
        companyName
        roleApprovalStatus
        createdAt
        profileImg {
            public_id
            secure_url
            asset_id
            version
            format
            width
            height
            created_at
        }
        legalDocImg {
            public_id
            secure_url
            asset_id
            version
            format
            width
            height
            created_at
        }
        address
        updatedAt
    }
}
`
const APPROVE_ROLE_REQUEST = gql`
mutation approveRoleChangeRequest($userId: ID!) {
    approveRoleChangeRequest(userId: $userId) {
        message
        success
    }
}
`
const REJECT_ROLE_REQUEST = gql`
mutation rejectRoleChangeRequest($userId: ID!,$rejectionReason: String!) {
    rejectRoleChangeRequest(userId: $userId, rejectionReason: $rejectionReason) {
        message
        success
    }
}
`

const GET_ALL_USERS = gql`
query Users {
    users {
        id
        name
        email
        role
        address
        esewaId
        phone
        companyName
        roleApprovalStatus
        createdAt
        updatedAt
        profileImg {
            public_id
            secure_url
        }
        legalDocImg {
            public_id
            secure_url
        }
    }
}

`

export {PENDING_ROLE_REQUESTS,APPROVE_ROLE_REQUEST,REJECT_ROLE_REQUEST,GET_ALL_USERS};