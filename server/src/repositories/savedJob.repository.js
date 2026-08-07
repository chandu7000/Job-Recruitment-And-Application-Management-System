import { Op } from "sequelize";

import SavedJob from "../models/savedJob.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";

export const findSavedJob = (
    candidateId,
    jobId,
    options = {}
) =>
    SavedJob.findOne({
        where: {
            candidateId,
            jobId
        },
        ...options
    });

export const createSavedJob = (
    values,
    options = {}
) =>
    SavedJob.create(
        values,
        options
    );

export const deleteSavedJob = (
    candidateId,
    jobId
) =>
    SavedJob.destroy({
        where: {
            candidateId,
            jobId
        }
    });

export const listSavedJobs = async (
    candidateId,
    {
        limit,
        offset,
        search,
        sort = "createdAt",
        order = "DESC"
    }
) =>
    SavedJob.findAndCountAll({
        where: {
            candidateId
        },

        include: [
            {
                model: Job,
                as: "job",
                required: true,

                where: search
                    ? {
                          [Op.or]: [
                              {
                                  title: {
                                      [Op.like]:
                                          `%${search}%`
                                  }
                              },
                              {
                                  location: {
                                      [Op.like]:
                                          `%${search}%`
                                  }
                              }
                          ]
                      }
                    : undefined,

                include: [
                    {
                        model: Company,
                        as: "company",
                        required: true
                    }
                ]
            }
        ],

        limit,
        offset,
        distinct: true,

        order:
            sort === "title"
                ? [
                      [
                          {
                              model: Job,
                              as: "job"
                          },
                          "title",
                          order
                      ]
                  ]
                : [
                      [
                          sort,
                          order
                      ]
                  ]
    });