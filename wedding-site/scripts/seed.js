const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(
  __dirname,
  "../serviceAccountKey.json"
));

function normalizeId(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

const guests = [
  {
    surname: "Idowu",
    guestGroup: "bride-groom",
    churchSeatLimit: 5,
    members: [
      {
        fullName: "Joseph Idowu",
        churchEligible: true,
      },
    ],
  },
];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedGuests() {
  for (const family of guests) {
    const familyId = normalizeId(family.surname);
    const familyRef = db.collection("families").doc(familyId);

    await familyRef.set({
      surname: family.surname,
      familyNameKey: familyId,
      contactEmail: "",
      contactPhone: "",
      rsvpStatus: "pending",
      churchSeatLimit: family.churchSeatLimit,
      churchSeatsUsed: 0,
      guestGroup: family.guestGroup,
    });

    for (const member of family.members) {
      const memberId = normalizeId(member.fullName);
      const memberRef = familyRef.collection("members").doc(memberId);

      await memberRef.set({
        fullName: member.fullName,
        attendingWedding: false,
        attendingChurch: false,
        churchEligible: member.churchEligible,
        rsvpStatus: "pending",
        submittedAt: null,
      });
    }

    console.log(`Seeded family: ${family.surname}`);
  }

  console.log("Guest seeding complete.");
}

seedGuests().catch((error) => {
  console.error(error);
  process.exit(1);
});