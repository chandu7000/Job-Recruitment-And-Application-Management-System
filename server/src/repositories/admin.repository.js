import User from "../models/user.model.js";

const findAllUsers = async ({
    limit,
    offset
} = {}) => {
    return User.findAndCountAll({
        limit,
        offset,
        order: [
            ["createdAt", "DESC"]
        ]
    });
};

const findUserById = async (
    userId
) => {

    return User.findByPk(
        userId
    );
};

const updateUserStatus = async (
    userId,
    status,
    {
        transaction
    } = {}
) => {

    const user =
        await User.findByPk(
            userId,
            {
                transaction
            }
        );

    if (!user) {
        return null;
    }
    await user.update(
        {
            status
        },
        {
            transaction
        }
    );
    return user;
};

export {
    findAllUsers,
    findUserById,
    updateUserStatus
};