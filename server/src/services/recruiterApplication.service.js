import { sequelize } from "../config/database.js";

import AppError from "../utils/AppError.js";
import Job from "../models/job.model.js";

import {
    getPagination,
    getPaginationMeta
} from "../utils/pagination.js";

import {
    APPLICATION_STATUS_VALUES
} from "../constants/application.constants.js";

import {
    assertApplicationTransition
} from "../utils/applicationStatusTransition.js";

import * as applicationRepository
    from "../repositories/application.repository.js";

import {
    emitApplicationNotification
} from "./applicationNotification.service.js";

const getOwnedJobIds = async (
    recruiterId
) => {
    const jobs = await Job.findAll({
        where: {
            createdBy: recruiterId
        },
        attributes: ["id"]
    });

    return jobs.map((job) => job.id);
};

const ensureOwnedApplication = async (
    recruiterId,
    applicationId,
    options = {}
) => {
    const application =
        await applicationRepository.findApplication(
            applicationId,
            options
        );

    if (!application) {
        throw new AppError(
            "Application not found.",
            404,
            "APPLICATION_NOT_FOUND"
        );
    }

    const job = await Job.findOne({
        where: {
            id: application.jobId,
            createdBy: recruiterId
        },
        transaction: options.transaction,
        lock: options.lock
    });

    if (!job) {
        throw new AppError(
            "You do not own this application job.",
            403,
            "APPLICATION_OWNERSHIP_REQUIRED"
        );
    }

    return application;
};

export const listApplicants = async ({
    recruiterId,
    query
}) => {
    const jobIds =
        await getOwnedJobIds(recruiterId);

    const pagination =
        getPagination(query);

    const result =
        await applicationRepository
            .listRecruiterApplications(
                jobIds,
                {
                    ...pagination,
                    ...query,
                    order:
                        (
                            query.order ||
                            "DESC"
                        ).toUpperCase()
                }
            );

    return {
        items: result.rows,
        meta: getPaginationMeta(
            pagination.page,
            pagination.limit,
            result.count
        )
    };
};

export const getApplicantDetails = async ({
    recruiterId,
    applicationId
}) => {
    const application =
        await ensureOwnedApplication(
            recruiterId,
            applicationId
        );

    const statusHistory =
        await applicationRepository
            .getStatusHistory(
                application.id
            );

    return {
        ...application.toJSON(),
        statusHistory
    };
};

export const updateRecruiterNotes = async ({
    recruiterId,
    applicationId,
    notes
}) => {
    const application =
        await ensureOwnedApplication(
            recruiterId,
            applicationId
        );

    await application.update({
        recruiterNotes:
            notes?.trim() || null
    });

    return application;
};

export const changeApplicationStatus = async ({
    recruiterId,
    applicationId,
    status,
    reason
}) =>
    sequelize.transaction(
        async (transaction) => {
            if (
                !APPLICATION_STATUS_VALUES
                    .includes(status)
            ) {
                throw new AppError(
                    "Invalid application status.",
                    422,
                    "INVALID_APPLICATION_STATUS"
                );
            }

            const application =
                await ensureOwnedApplication(
                    recruiterId,
                    applicationId,
                    {
                        transaction,
                        lock:
                            transaction.LOCK.UPDATE
                    }
                );

            const previousStatus =
                application.status;

            assertApplicationTransition(
                previousStatus,
                status
            );

            await application.update(
                {
                    status
                },
                {
                    transaction
                }
            );

            await applicationRepository
                .createStatusHistory(
                    {
                        applicationId:
                            application.id,

                        previousStatus,

                        newStatus: status,

                        changedBy:
                            recruiterId,

                        reason:
                            reason?.trim() ||
                            null
                    },
                    {
                        transaction
                    }
                );

            emitApplicationNotification({
                type:
                    "APPLICATION_STATUS_CHANGED",

                applicationId:
                    application.id,

                status
            }).catch(() => {});

            return application;
        }
    );

export const applicationHistory = async ({
    recruiterId,
    applicationId
}) => {
    await ensureOwnedApplication(
        recruiterId,
        applicationId
    );

    return applicationRepository
        .getStatusHistory(
            applicationId
        );
};