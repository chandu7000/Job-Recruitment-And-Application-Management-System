import RecruiterProfile from
    "../models/recruiterProfile.model.js";

const createRecruiterProfile = async (
    profileData,
    { transaction } = {}
) => {
    return RecruiterProfile.create(
        profileData,
        {
            transaction
        }
    );
};

const findRecruiterProfileByUserId = async (
    userId,
    { transaction, lock } = {}
) => {
    return RecruiterProfile.findOne({
        where: {
            userId
        },
        transaction,
        lock
    });
};

const updateRecruiterProfileByUserId = async (
    userId,
    profileData,
    { transaction } = {}
) => {
    const profile =
        await RecruiterProfile.findOne({
            where: {
                userId
            },
            transaction
        });

    if (!profile) {
        return null;
    }

    await profile.update(
        profileData,
        {
            transaction
        }
    );

    return profile;
};

const deleteRecruiterProfileByUserId = async (
    userId,
    { transaction } = {}
) => {
    const profile =
        await RecruiterProfile.findOne({
            where: {
                userId
            },
            transaction
        });

    if (!profile) {
        return null;
    }

    await profile.destroy({
        transaction
    });

    return profile;
};

export {
    createRecruiterProfile,
    findRecruiterProfileByUserId,
    updateRecruiterProfileByUserId,
    deleteRecruiterProfileByUserId
};