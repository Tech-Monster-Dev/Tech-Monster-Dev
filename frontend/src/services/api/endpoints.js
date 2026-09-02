export const API = {

  PUBLIC: {
    HERO_STATS: "/public/hero-stats"
  },


  AUTH: {

    LOGIN: "/auth/login",

    SIGNUP: "/auth/signup",

    LOGOUT: "/auth/logout",

    FORGOT_PASSWORD: "/auth/forgot-password",

    RESET_PASSWORD: "/auth/reset-password",

    VERIFY_OTP: "/auth/verify-otp",

    RESEND_OTP: "/auth/resend-otp",

    COMPLETE_PROFILE: "/auth/profile",

    ADMIN_LOGIN: "/auth/admin/login",

  },


  USER: {
    DELETE_ACCOUNT: "/users/delete-account"
  },

  STUDENT: {

    PROFILE: "/student/profile",

    TASKS: "/student/tasks",

    ATTENDANCE: "/student/attendance",

  },

  ADMIN: {

    USERS: "/admin/users",

    INTERNSHIPS: "/admin/internships",

    TASKS: {

      PENDING: "/admin/tasks/pending",

      APPROVED: "/admin/tasks/approved",

      DETAILS: (id) => `/admin/tasks/${id}`,

      APPROVE: (id) => `/admin/tasks/${id}/approve`,

      REJECT: (id) => `/admin/tasks/${id}/reject`

    },

    SUBMISSIONS: {

      BASE: "/admin/submissions",

      DETAILS: (id) => `/admin/submissions/${id}`,

      APPROVE: (id) => `/admin/submissions/${id}/approve`,

      REJECT: (id) => `/admin/submissions/${id}/reject`,

      EXTEND: (id) => `/admin/submissions/${id}/extend`

    },

    CERTIFICATE_PAYMENTS: {

      PENDING: "/certificate-payments/admin/pending",

      DETAILS: (id) => `/certificate-payments/admin/${id}`,

      APPROVE: (id) => `/certificate-payments/admin/${id}/approve`,

      REJECT: (id) => `/certificate-payments/admin/${id}/reject`

    }

  },

  PROFILE: {
    GET: "/profile",
    GET_USER: (userId) => `/profile/user/${userId}`,
    UPDATE: "/profile",
    IMAGE: "/profile/profile-image"
  },
  DASHBOARD: {
    STUDENT: "/dashboard/student",
    ADMIN: "/dashboard/admin"
  },

  SERVER: {

    STATUS: "/server/status"

  },

  INTERNSHIPS: {
    BASE: "/internships",
    BY_ID: (id) => `/internships/${id}`,
    BY_SLUG: (slug) => `/internships/slug/${slug}`,
    JOIN: (id) => `/internships/${id}/join`,
    PROGRESS: (id) => `/internships/${id}/progress`,
    COMPLETE: (id) => `/internships/${id}/complete`,
    COMPLETE_LESSON: (slug) => `/internships/slug/${slug}/complete-lesson`,
    COMPLETED_LESSONS: (slug) => `/internships/slug/${slug}/completed-lessons`
  },

  COURSES: {
    BASE: "/courses",
    BY_ID: (id) => `/courses/${id}`,
    BY_SLUG: (slug) => `/courses/slug/${slug}`,
    JOIN: (id) => `/courses/${id}/join`,
    PROGRESS: (id) => `/courses/${id}/progress`,
    COMPLETE: (id) => `/courses/${id}/complete`,
    COMPLETE_LESSON: (slug) => `/courses/slug/${slug}/complete-lesson`,
    COMPLETED_LESSONS: (slug) => `/courses/slug/${slug}/completed-lessons`
  },

  // NEW
  LEARNING: {
    CONTENT: (type, slug) => `/learning/${type}/${slug}`
  },

  SUBMISSIONS: {
    BASE: "/submissions",
    MY: "/submissions/my",
    COURSE: (courseSlug) => `/submissions/course/${courseSlug}`,
  },

  CERTIFICATE_PAYMENTS: {
    CREATE: "/certificate-payments/create",
    VERIFY: "/certificate-payments/verify",
    VERIFY_QR: "/certificate-payments/verify-qr",
    CANCEL: "/certificate-payments/cancel",
    MY: "/certificate-payments/my",
  },

  MESSAGE: {

    BASE: "/messages",

    USERS: "/messages/users",

    SEARCH: "/messages/search"

  },

  SUPPORT: {

    CONVERSATION: "/support/conversation",
    CONVERSATION_BY_ID: (conversationId) => `/support/conversation/${conversationId}`,

    INBOX: "/support/inbox",

    MESSAGES: (conversationId) =>
      `/support/conversation/${conversationId}/messages`,

    UPDATE_CONVERSATION: (conversationId) =>
      `/support/conversation/${conversationId}`

  },

  FOLLOW: {
    FOLLOW_USER: (userId) => `/follow/${userId}`,
    UNFOLLOW_USER: (userId) => `/follow/${userId}`,
    FOLLOWERS: (userId) => `/follow/${userId}/followers`,
    FOLLOWING: (userId) => `/follow/${userId}/following`
  },
};
