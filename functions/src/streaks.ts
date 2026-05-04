import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

export const streakMaintenance = onSchedule("every day 00:00", async (event) => {
  const db = admin.firestore();
  const usersSnapshot = await db.collection("users").get();
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const batch = db.batch();
  let count = 0;

  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.userProfile) {
      const lastStudyDate = data.userProfile.lastStudyDate; // format: YYYY-MM-DD
      // If user hasn't studied today or yesterday, streak breaks
      if (lastStudyDate !== todayStr && lastStudyDate !== yesterdayStr && data.userProfile.streak > 0) {
        const userRef = db.collection("users").doc(doc.id);
        batch.update(userRef, { "userProfile.streak": 0 });
        count++;
      }
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Reset streak for ${count} users.`);
  } else {
    console.log("No streaks needed resetting.");
  }
});
