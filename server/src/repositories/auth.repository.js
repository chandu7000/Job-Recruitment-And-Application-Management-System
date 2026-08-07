import User from "../models/user.model.js";

import {
  ACCOUNT_STATUS
} from "../constants/app.constants.js";

const createUser = async (
  userData,
  { transaction } = {}
) => {
  return User.create(userData, {
    transaction
  });
};

const findUserByEmail = async (
  email,
  includePassword = false,
  { transaction, lock } = {}
) => {
  const userModel = includePassword
    ? User.scope("withPassword")
    : User;

  return userModel.findOne({
    where: {
      email: email.toLowerCase().trim()
    },
    transaction,
    lock
  });
};

const findUserById = async (
  id,
  { transaction, lock } = {}
) => {
  return User.findByPk(id, {
    transaction,
    lock
  });
};

const updateUser = async (
  id,
  data,
  { transaction } = {}
) => {
  const user = await User.findByPk(id, {
    transaction
  });

  if (!user) {
    return null;
  }

  await user.update(data, {
    transaction
  });

  return user;
};

const findUserByIdWithPassword = async (
  id,
  { transaction, lock } = {}
) => {
  return User
    .scope("withPassword")
    .findByPk(id, {
      transaction,
      lock
    });
};

const savePasswordResetToken = async (
  {
    email,
    passwordResetToken,
    passwordResetExpiresAt
  },
  { transaction } = {}
) => {
  return User.update(
    {
      passwordResetToken,
      passwordResetExpiresAt
    },
    {
      where: {
        email
      },
      transaction
    }
  );
};

const findUserByPasswordResetToken = async (
  passwordResetToken,
  { transaction, lock } = {}
) => {
  return User
    .scope("withAuthenticationFields")
    .findOne({
      where: {
        passwordResetToken
      },
      transaction,
      lock
    });
};

const updatePassword = async (
  {
    userId,
    passwordHash
  },
  { transaction } = {}
) => {
  return User.update(
    {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
      passwordChangedAt: new Date()
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const updateUserPassword = async (
  {
    userId,
    passwordHash
  },
  { transaction } = {}
) => {
  return User.update(
    {
      passwordHash,
      passwordChangedAt: new Date()
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const saveEmailVerificationToken = async (
  {
    userId,
    token,
    expiresAt
  },
  { transaction } = {}
) => {
  return User.update(
    {
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const findUserByEmailVerificationToken = async (
  token,
  { transaction, lock } = {}
) => {
  return User
    .scope("withAuthenticationFields")
    .findOne({
      where: {
        emailVerificationToken: token
      },
      transaction,
      lock
    });
};

const verifyUserEmail = async (
  userId,
  { transaction } = {}
) => {
  return User.update(
    {
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const incrementFailedLoginAttempts = async (
  {
    userId,
    maximumAttempts,
    lockDurationMinutes
  },
  { transaction, lock } = {}
) => {
  const user = await User.findByPk(userId, {
    transaction,
    lock
  });

  if (!user) {
    return null;
  }

  const failedLoginAttempts =
    user.failedLoginAttempts + 1;

  const shouldLockAccount =
    failedLoginAttempts >= maximumAttempts;

  const lockedUntil = shouldLockAccount
    ? new Date(
      Date.now() +
      lockDurationMinutes * 60 * 1000
    )
    : null;

  await user.update(
    {
      failedLoginAttempts,
      lockedUntil
    },
    {
      transaction
    }
  );

  return {
    user,
    failedLoginAttempts,
    lockedUntil,
    accountLocked: shouldLockAccount
  };
};

const resetFailedLoginAttempts = async (
  userId,
  { transaction } = {}
) => {
  const user = await User.findByPk(userId, {
    transaction
  });

  if (!user) {
    return null;
  }

  return user.update(
    {
      failedLoginAttempts: 0,
      lockedUntil: null
    },
    {
      transaction
    }
  );
};

const updateLastLogin = async (
  userId,
  { transaction } = {}
) => {
  const user = await User.findByPk(userId, {
    transaction
  });

  if (!user) {
    return null;
  }

  return user.update(
    {
      lastLoginAt: new Date()
    },
    {
      transaction
    }
  );
};

const clearPasswordResetToken = async (
  userId,
  { transaction } = {}
) => {
  return User.update(
    {
      passwordResetToken: null,
      passwordResetExpiresAt: null
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const saveEmailChangeRequest = async (
  {
    userId,
    pendingEmail,
    emailChangeToken,
    emailChangeExpiresAt
  },
  { transaction } = {}
) => {
  return User.update(
    {
      pendingEmail,
      emailChangeToken,
      emailChangeExpiresAt
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const findUserByEmailChangeToken = async (
  emailChangeToken,
  { transaction, lock } = {}
) => {
  return User
    .scope("withAuthenticationFields")
    .findOne({
      where: {
        emailChangeToken
      },
      transaction,
      lock
    });
};

const completeEmailChange = async (
  {
    userId,
    newEmail
  },
  { transaction } = {}
) => {
  return User.update(
    {
      email: newEmail.trim().toLowerCase(),
      emailVerifiedAt: new Date(),
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeExpiresAt: null
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

const clearEmailChangeRequest = async (
  userId,
  { transaction } = {}
) => {
  return User.update(
    {
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeExpiresAt: null
    },
    {
      where: {
        id: userId
      },
      transaction
    }
  );
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  savePasswordResetToken,
  findUserByPasswordResetToken,
  updatePassword,
  updateUserPassword,
  saveEmailVerificationToken,
  findUserByEmailVerificationToken,
  verifyUserEmail,
  incrementFailedLoginAttempts,
  resetFailedLoginAttempts,
  updateLastLogin,
  clearPasswordResetToken,
  saveEmailChangeRequest,
  findUserByEmailChangeToken,
  completeEmailChange,
  clearEmailChangeRequest
};