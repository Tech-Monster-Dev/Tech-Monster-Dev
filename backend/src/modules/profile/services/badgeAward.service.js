import Badge from "../models/Badges.js";
import UserBadge from "../models/UserBadge.js";
import StudentInternship from "../../internships/models/StudentInternship.js";

const BADGE_DEFINITIONS = {
  COURSE: [
    { title: "Course Starter", description: "Completed your first course.", requirement: "Complete 1 course.", icon: "🎓", color: "#FFD700" },
    { title: "Course Finisher", description: "Completed 3 courses.", requirement: "Complete 3 courses.", icon: "🏆", color: "#FFD700" },
    { title: "Course Master", description: "Completed 5 courses.", requirement: "Complete 5 courses.", icon: "👑", color: "#FFD700" }
  ],
  INTERNSHIP: [
    { title: "Internship Completed", description: "Successfully completed an internship.", requirement: "Complete 1 internship.", icon: "💼", color: "#FFD700" }
  ]
};

const ensureBadge = async (definition, category) => {
  return Badge.findOneAndUpdate(
    { title: definition.title, category },
    { $setOnInsert: { ...definition, category } },
    { returnDocument: "after", upsert: true }
  );
};

export const awardBadge = async ({ userId, definition, category }) => {
  const badge = await ensureBadge(definition, category);
  const existing = await UserBadge.findOne({ user: userId, badge: badge._id });
  if (existing) return { awarded: false, badge: existing };

  const userBadge = await UserBadge.create({
    user: userId,
    badge: badge._id,
    earnedAt: new Date(),
    earnedDate: new Date()
  });

  return { awarded: true, badge: userBadge };
};

export const awardCourseMilestoneBadges = async (userId) => {
  const completedCourses = await StudentInternship.countDocuments({
    student: userId,
    course: { $exists: true, $ne: null },
    status: "Completed"
  });

  const milestones = [
    { count: 1, title: "Course Starter" },
    { count: 3, title: "Course Finisher" },
    { count: 5, title: "Course Master" }
  ];

  for (const milestone of milestones) {
    if (completedCourses >= milestone.count) {
      const definition = getBadgeDefinition("COURSE", milestone.title);
      if (definition) {
        await awardBadge({
          userId,
          definition,
          category: "COURSE"
        });
      }
    }
  }
};

export const awardInternshipCompletionBadge = async (userId) => {
  const completedInternships = await StudentInternship.countDocuments({
    student: userId,
    internship: { $exists: true, $ne: null },
    status: "Completed"
  });

  if (completedInternships < 1) return;

  const definition = getBadgeDefinition(
    "INTERNSHIP",
    "Internship Completed"
  );

  if (definition) {
    await awardBadge({
      userId,
      definition,
      category: "INTERNSHIP"
    });
  }
};

export const syncCompletionBadges = async (userId) => {
  await awardCourseMilestoneBadges(userId);
  await awardInternshipCompletionBadge(userId);
};

export const getBadgeDefinition = (category, title) => BADGE_DEFINITIONS[category]?.find((badge) => badge.title === title) || null;

export { BADGE_DEFINITIONS };
