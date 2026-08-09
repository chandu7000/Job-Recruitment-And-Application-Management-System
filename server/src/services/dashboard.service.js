import { Op, col, fn } from "sequelize";

import Application from "../models/application.model.js";
import Company from "../models/company.model.js";
import Interview from "../models/interview.model.js";
import Job from "../models/job.model.js";
import JobSeekerProfile from "../models/jobSeekerProfile.model.js";
import Notification from "../models/notification.model.js";
import Report from "../models/report.model.js";
import SavedJob from "../models/savedJob.model.js";
import User from "../models/user.model.js";
import RecruiterProfile from "../models/recruiterProfile.model.js";

import {
  ACTIVE_INTERVIEW_STATUSES
} from "../constants/interview.constants.js";

const grouped = async (
  model,
  field,
  where = {}
) => Object.fromEntries(
  (await model.findAll({
    attributes: [
      field,
      [fn("COUNT", col("id")), "count"]
    ],
    where,
    group: [field],
    raw: true
  })).map((item) => [
    item[field],
    Number(item.count)
  ])
);

export const getAdminDashboard = async () => ({
  users: {
    total: await User.count(),
    byRole: await grouped(User, "role"),
    byStatus: await grouped(User, "status")
  },
  companies: {
    total: await Company.count(),
    byStatus: await grouped(Company, "status")
  },
  jobs: {
    total: await Job.count(),
    byStatus: await grouped(Job, "status")
  },
  applications: {
    total: await Application.count(),
    byStatus: await grouped(Application, "status")
  },
  interviews: {
    total: await Interview.count(),
    byStatus: await grouped(Interview, "status")
  },
  reports: {
    total: await Report.count(),
    byStatus: await grouped(Report, "status")
  }
});

export const getRecruiterDashboard = async (
  userId
) => {
  const companies = await Company.findAll({
    where: { ownerId: userId },
    attributes: ["id", "companyName", "status"]
  });
  const companyIds = companies.map((company) => company.id);
  const jobIds = (await Job.findAll({
    where: { companyId: companyIds },
    attributes: ["id"]
  })).map((job) => job.id);
  const profile = await RecruiterProfile.findOne({
    where: { userId },
    attributes: [
      "firstName",
      "lastName",
      "designation",
      "phoneNumber",
      "biography",
      "linkedinUrl"
    ]
  });
  const profileFields = profile
    ? Object.values(profile.toJSON())
    : [];
  const completedProfileFields =
    profileFields.filter(Boolean).length;

  return {
    company: companies[0] || null,
    companyStatus: companies.map((company) => ({
      id: company.id,
      companyName: company.companyName,
      status: company.status
    })),
    jobs: {
      total: jobIds.length,
      byStatus: await grouped(Job, "status", {
        companyId: companyIds
      })
    },
    applications: {
      total: await Application.count({
        where: { jobId: jobIds }
      }),
      byStatus: await grouped(Application, "status", {
        jobId: jobIds
      })
    },
    interviews: {
      total: await Interview.count({
        where: { recruiterId: userId }
      }),
      upcoming: await Interview.count({
        where: {
          recruiterId: userId,
          status: {
            [Op.in]: ACTIVE_INTERVIEW_STATUSES
          },
          scheduledStartAt: {
            [Op.gte]: new Date()
          }
        }
      }),
      byStatus: await grouped(Interview, "status", {
        recruiterId: userId
      })
    },
    unreadNotificationCount:
      await Notification.count({
        where: {
          userId,
          isRead: false
        }
      }),
    profile: {
      exists: Boolean(profile),
      completionPercentage:
        profileFields.length
          ? Math.round(
            completedProfileFields /
            profileFields.length * 100
          )
          : 0
    }
  };
};

export const getJobSeekerSummary = async (
  userId
) => {
  const profile = await JobSeekerProfile.findOne({
    where: { userId }
  });
  return {
    applications: {
      total: await Application.count({
        where: { candidateId: userId }
      }),
      byStatus: await grouped(Application, "status", {
        candidateId: userId
      })
    },
    savedJobCount: await SavedJob.count({
      where: { userId }
    }),
    interviews: {
      total: await Interview.count({
        where: { candidateId: userId }
      }),
      byStatus: await grouped(Interview, "status", {
        candidateId: userId
      })
    },
    unreadNotificationCount:
      await Notification.count({
        where: { userId, isRead: false }
      }),
    profileCompletionPercentage:
      profile?.profileCompletionPercentage || 0,
    resumeAvailable: Boolean(profile?.resumeUrl)
  };
};
