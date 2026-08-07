import { Op } from "sequelize";

import JobSeekerProfile from
    "../models/jobSeekerProfile.model.js";

import JobSeekerSkill from
    "../models/jobSeekerSkill.model.js";

const findCandidates = async ({
    limit,
    offset,
    search,
    skill
}) => {
    const where = {};

    if (search) {
        where[Op.or] = [
            {
                firstName: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                lastName: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                headline: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                location: {
                    [Op.like]: `%${search}%`
                }
            }
        ];

    }

    return JobSeekerProfile.findAndCountAll({

        where,
        include: [
            {
                model: JobSeekerSkill,
                as: "skills",

                required:
                    Boolean(skill),

                where:
                    skill
                        ? {
                            skillName: {
                                [Op.like]:
                                    `%${skill}%`
                            }
                        }
                        : undefined
            }
        ],

        limit,
        offset,
        distinct: true,
        order: [
            [
                "createdAt",
                "DESC"
            ]
        ]
    });
};


export {
    findCandidates
};