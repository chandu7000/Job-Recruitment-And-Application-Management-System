import JobSeekerProfile from
    "../models/jobSeekerProfile.model.js";

const createJobSeekerProfile = async (
    profileData,
    { transaction } = {}
) => {
    return JobSeekerProfile.create(
        profileData,
        {
            transaction
        }
    );
};

const findJobSeekerProfileByUserId = async (
    userId,
    { transaction, lock } = {}
) => {
    return JobSeekerProfile.findOne({
        where: {
            userId
        },
        transaction,
        lock
    });
};

const findOrCreateJobSeekerProfile = async (
    userId,
    { transaction } = {}
) => {
    const [profile, created] =
        await JobSeekerProfile.findOrCreate({
            where: {
                userId
            },
            defaults: {
                userId
            },
            transaction
        });

    return {
        profile,
        created
    };
};

const updateJobSeekerProfileByUserId = async (
    userId,
    profileData,
    { transaction } = {}
) => {
    const profile =
        await JobSeekerProfile.findOne({
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

const updateJobSeekerUploadsByUserId = async (
    userId,
    uploadData,
    { transaction } = {}
) => {
    const profile =
        await JobSeekerProfile.findOne({
            where: {
                userId
            },
            transaction
        });

    if (!profile) {
        return null;
    }

    await profile.update(
        uploadData,
        {
            transaction
        }
    );

    return profile;
};

const clearJobSeekerProfileImageByUserId = async (
    userId,
    { transaction } = {}
) => {
    const profile =
        await JobSeekerProfile.findOne({
            where: {
                userId
            },
            transaction
        });

    if (!profile) {
        return null;
    }

    await profile.update(
        {
            profileImageUrl: null,
            profileImagePublicId: null
        },
        {
            transaction
        }
    );

    return profile;
};

const clearJobSeekerResumeByUserId = async (
    userId,
    { transaction } = {}
) => {
    const profile =
        await JobSeekerProfile.findOne({
            where: {
                userId
            },
            transaction
        });

    if (!profile) {
        return null;
    }

    await profile.update(
        {
            resumeUrl: null,
            resumePublicId: null,
            resumeOriginalName: null
        },
        {
            transaction
        }
    );

    return profile;
};

export {
    createJobSeekerProfile,
    findJobSeekerProfileByUserId,
    findOrCreateJobSeekerProfile,
    updateJobSeekerProfileByUserId,
    updateJobSeekerUploadsByUserId,
    clearJobSeekerProfileImageByUserId,
    clearJobSeekerResumeByUserId,
};