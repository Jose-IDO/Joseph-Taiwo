const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require(path.join(
  __dirname,
  "../serviceAccountKey.json"
));

function normalizeId(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const families = [
  {
    surname: "Olusegun",
    guestGroup: "bride-groom",
    members: ["Joshua Olusegun", "Olive Olusegun"],
  },
  {
    surname: "Maduna",
    guestGroup: "bride-groom",
    members: ["Mandisa Maduna"],
  },
  {
    surname: "Idowu",
    guestGroup: "bride-groom",
    members: [
      "Moses Idowu",
      "Samuel Idowu",
      "Ibukun Idowu",
      "Tolu Idowu",
      "Oreoluwa Idowu",
    ],
  },
  {
    surname: "Adrigwe",
    guestGroup: "bride-groom",
    members: ["Paul Adrigwe"],
  },
  {
    surname: "Seshibe",
    guestGroup: "bride-groom",
    members: ["Tebogo Seshibe"],
  },
  {
    surname: "Okorie",
    guestGroup: "bride-groom",
    members: ["Nneka Okorie", "Ike Okorie"],
  },
  {
    surname: "Aremu",
    guestGroup: "bride-groom",
    members: ["Tobi Aremu"],
  },
  {
    surname: "Ratau",
    guestGroup: "bride-groom",
    members: ["Lesego Ratau"],
  },
  {
    surname: "Mashishi",
    guestGroup: "bride-groom",
    members: ["Kefilwe Mashishi"],
  },
  {
    surname: "Mateme",
    guestGroup: "bride-groom",
    members: ["Kgothatso Mateme"],
  },
  {
    surname: "Ogunbanjo",
    guestGroup: "bride-groom",
    members: ["Segun Ogunbanjo"],
  },
  {
    surname: "Ngoato",
    guestGroup: "bride-groom",
    members: ["Tebogo Ngoato"],
  },
  {
    surname: "Adegbenro",
    guestGroup: "bride-groom",
    members: ["Mercy Adegbenro", "Peace Adegbenro"],
  },
  {
    surname: "Abe",
    guestGroup: "bride-groom",
    members: ["Pelumi Abe", "Ayo Abe", "Victoria Abe"],
  },
  {
    surname: "Burnham",
    guestGroup: "bride-groom",
    members: ["Jesse Burnham", "Kaylin Burnham"],
  },
  {
    surname: "Qwesha",
    guestGroup: "bride-groom",
    members: ["Samora Qwesha"],
  },
  {
    surname: "Gbenro",
    guestGroup: "bride-groom",
    members: ["Sam Gbenro"],
  },
  {
    surname: "Lefenya",
    guestGroup: "bride-groom",
    members: ["Kamo Lefenya", "Baile Lefenya"],
  },
  {
    surname: "Mashila",
    guestGroup: "bride-groom",
    members: ["Erica Mashila"],
  },
  {
    surname: "Obi",
    guestGroup: "bride-groom",
    members: ["Deborah Obi"],
  },
  {
    surname: "Ojo",
    guestGroup: "bride-groom",
    members: ["Emmanuel Ojo", "Palesa Ojo"],
  },
  {
    surname: "Adepoju",
    guestGroup: "bride-groom",
    members: ["Oluwadamilare (Dami) Adepoju", "Adedoyin Adepoju"],
  },
  {
    surname: "Mokhele",
    guestGroup: "bride-groom",
    members: ["Mokhele Mokhele"],
  },
  {
    surname: "Williams",
    guestGroup: "bride-groom",
    members: ["Emmanuel Williams", "Tinu Williams"],
  },
  {
    surname: "Ayomidotun",
    guestGroup: "bride-groom",
    members: ["Leke Ayomidotun"],
  },
  {
    surname: "Akinola",
    guestGroup: "bride-groom",
    members: [
      "Ileri Akinola",
      "Simi Akinola",
      "Oreofeoluwa Akinola",
      "Aanuoluwa Akinola",
    ],
  },
  {
    surname: "Malatjie",
    guestGroup: "bride-groom",
    members: ["Mr Malatjie", "Mrs Malatjie"],
  },
  {
    surname: "Ojobaro",
    guestGroup: "bride-groom",
    members: ["Ore Ojobaro", "Laolu Ojobaro"],
  },
  {
    surname: "Olukunle",
    guestGroup: "bride-groom",
    members: ["Olatunbosun Olukunle"],
  },
  {
    surname: "Sole",
    guestGroup: "bride-groom",
    members: ["Mr Sole", "Mrs Sole"],
  },
  {
    surname: "Nhlapo",
    guestGroup: "bride-groom",
    members: ["Siphesihle Nhlapo"],
  },
  {
    surname: "Ackley",
    guestGroup: "bride-groom",
    members: ["Mr Ackley", "Mrs Ackley"],
  },
  {
    surname: "Mokolo",
    guestGroup: "bride-groom",
    members: ["Rosha Mokolo"],
  },
  {
    surname: "Canda",
    guestGroup: "bride-groom",
    members: ["Daisy Canda"],
  },
  {
    surname: "Adebanjo",
    guestGroup: "bride-groom",
    members: ["Taiwo Adebanjo"],
  },
  {
  surname: "Ogboro",
  guestGroup: "bride-groom",
  members: ["Josephine Ogboro"],
},
  {
    surname: "Oluwamakinde",
    guestGroup: "bride-groom",
    members: [
      "Flourish Oluwamakinde",
      "Faith Oluwamakinde",
      "Favour Oluwamakinde",
    ],
  },
  {
    surname: "Babatunde",
    guestGroup: "bride-groom",
    members: ["Ibukun Babatunde"],
  },
  {
    surname: "Nthlabathi",
    guestGroup: "bride-groom",
    members: ["Adeola Nthlabathi"],
  },
  {
    surname: "Nene",
    guestGroup: "bride-groom",
    members: ["Nana Nene (Aunty Gladys)"],
  },
  {
    surname: "Machika",
    guestGroup: "bride-groom",
    members: ["Rebotile Machika"],
  },
  {
    surname: "Qekema",
    guestGroup: "bride-groom",
    members: ["Siya Qekema", "Mvuni Qekema"],
  },
  {
    surname: "Zulu",
    guestGroup: "bride-groom",
    members: ["Walusungu Zulu"],
  },
  {
    surname: "Khumalo",
    guestGroup: "bride-groom",
    members: ["Siphiwe Khumalo"],
  },
  {
    surname: "Kahwenga",
    guestGroup: "bride-groom",
    members: ["Daisy Kahwenga"],
  },
  {
    surname: "Vundla",
    guestGroup: "bride-groom",
    members: ["Annabel Vundla"],
  },
  {
    surname: "Makhado",
    guestGroup: "bride-groom",
    members: ["Rejoice Makhado"],
  },
  {
    surname: "Rwizi",
    guestGroup: "bride-groom",
    members: ["Sharon Rwizi"],
  },
  {
    surname: "Ngwenya",
    guestGroup: "bride-groom",
    members: ["Hlengiwe Ngwenya"],
  },
  {
    surname: "Osu",
    guestGroup: "bride-groom",
    members: ["Mrs Temitope Osu", "Mr Michael Osu"],
  },
  {
    surname: "Osuyande",
    guestGroup: "bride-groom",
    members: ["Jerry Osuyande", "Wendy Osuyande"],
  },
];

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function seedGuests() {
  for (const family of families) {
    const familyId = normalizeId(family.surname);
    const familyRef = db.collection("families").doc(familyId);

    const uniqueMembers = [...new Set(family.members.map((name) => name.trim()))];

    await familyRef.set(
      {
        surname: family.surname,
        familyNameKey: familyId,
        contactEmail: "",
        contactPhone: "",
        rsvpStatus: "pending",
        churchSeatLimit: uniqueMembers.length,
        churchSeatsUsed: 0,
        guestGroup: family.guestGroup,
      },
      { merge: true }
    );

    const existingMembers = await familyRef.collection("members").get();

    for (const doc of existingMembers.docs) {
      await doc.ref.delete();
    }

    for (const memberName of uniqueMembers) {
      const memberId = normalizeId(memberName);
      const memberRef = familyRef.collection("members").doc(memberId);

      await memberRef.set({
        fullName: memberName,
        attendingWedding: false,
        attendingChurch: false,
        churchEligible: true,
        rsvpStatus: "pending",
        submittedAt: null,
      });
    }

    console.log(
      `Seeded ${family.surname}: ${uniqueMembers.length} guest${
        uniqueMembers.length === 1 ? "" : "s"
      }`
    );
  }

  console.log("Guest seeding complete.");
}

seedGuests().catch((error) => {
  console.error(error);
  process.exit(1);
});