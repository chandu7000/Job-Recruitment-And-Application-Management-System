import {
    getAllUsers,
    getUserById,
    activateUser,
    disableUser,
    suspendUser
} from "../services/admin.service.js";

import {
    sendSuccess
} from "../utils/apiResponse.js";

const getUsers = async (
    req,
    res,
    next
) => {
    try {
        const users =
            await getAllUsers({
                page:
                    Number(req.query.page) || 1,
                limit:
                    Number(req.query.limit) || 20
            });

        return sendSuccess(
            res,
            200,
            "Users fetched successfully.",
            users
        );

    } catch (error) {
        next(error);
    }
};

const getUser = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await getUserById(
                req.params.userId
            );

        return sendSuccess(
            res,
            200,
            "User fetched successfully.",
            user
        );

    } catch (error) {
        next(error);
    }
};

const activate = async (
    req,
    res,
    next
) => {

    try {
        const user =
            await activateUser(
                req.params.userId
            );

        return sendSuccess(
            res,
            200,
            "User activated successfully.",
            user
        );

    } catch (error) {
        next(error);
    }
};

const disable = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await disableUser(
                req.params.userId
            );

        return sendSuccess(
            res,
            200,
            "User disabled successfully.",
            user
        );

    } catch (error) {
        next(error);
    }
};

const suspend = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await suspendUser(
                req.params.userId
            );
        return sendSuccess(
            res,
            200,
            "User suspended successfully.",
            user
        );
    } catch (error) {
        next(error);
    }
};


export {
    getUsers,
    getUser,
    activate,
    disable,
    suspend
};