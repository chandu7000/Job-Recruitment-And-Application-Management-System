import {
    findAllUsers,
    findUserById,
    updateUserStatus
} from "../repositories/admin.repository.js";

import {
    ACCOUNT_STATUS
} from "../constants/app.constants.js";

import {
    revokeEveryUserSession
} from "./userSession.service.js";

import AppError from "../utils/AppError.js";


const getAllUsers = async ({
    page = 1,
    limit = 20
}) => {

    const offset =
        (page - 1) * limit;

    const result =
        await findAllUsers({
            limit,
            offset
        });

    return {
        users: result.rows,
        pagination: {
            total:
                result.count,
            page,
            limit
        }
    };
};

const getUserById = async (
    userId
) => {

    const user =
        await findUserById(
            userId
        );

    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            "USER_NOT_FOUND"
        );
    }
    return user;
};

const changeUserStatus = async ({
    userId,
    status
}) => {

    const user =
        await findUserById(
            userId
        );

    if (!user) {
        throw new AppError(
            "User not found.",
            404,
            "USER_NOT_FOUND"
        );
    }

    await updateUserStatus(
        userId,
        status
    );

    if (
        status === ACCOUNT_STATUS.DISABLED ||
        status === ACCOUNT_STATUS.SUSPENDED
    ) {

        await revokeEveryUserSession({
            userId,
            reason:
                status === ACCOUNT_STATUS.DISABLED
                    ? "ACCOUNT_DISABLED"
                    : "ACCOUNT_SUSPENDED"
        });
    }
    return findUserById(
        userId
    );
};


const activateUser = async (
    userId
) => {
    return changeUserStatus({
        userId,
        status:
            ACCOUNT_STATUS.ACTIVE
    });

};


const disableUser = async (
    userId
) => {

    return changeUserStatus({
        userId,
        status:
            ACCOUNT_STATUS.DISABLED
    });

};

const suspendUser = async (
    userId
) => {

    return changeUserStatus({
        userId,
        status:
            ACCOUNT_STATUS.SUSPENDED
    });
};


export {
    getAllUsers,
    getUserById,
    activateUser,
    disableUser,
    suspendUser
};