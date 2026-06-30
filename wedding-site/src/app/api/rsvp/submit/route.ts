import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

const GROUP_LIMITS = {
  "bride-groom": 50,
  parents: 50,
} as const;

type GuestGroup = keyof typeof GROUP_LIMITS;

type SubmittedMember = {
  id: string;
  attendingWedding?: boolean;
  attendingChurch?: boolean;
  contactEmail?: string;
  contactPhone?: string;
};

export async function POST(request: Request) {
  try {
    const { familyId, members } = await request.json();

    if (!familyId || !Array.isArray(members)) {
      return NextResponse.json(
        { error: "Family ID and members are required" },
        { status: 400 }
      );
    }

    const familyRef = adminDb.collection("families").doc(familyId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    const familyData = familyDoc.data();

    const guestGroup = (familyData?.guestGroup ?? "bride-groom") as GuestGroup;

    const existingMembersSnapshot = await familyRef.collection("members").get();
    const familyChurchLimit = existingMembersSnapshot.size;
    const previousFamilyChurchSeats = Number(familyData?.churchSeatsUsed ?? 0);

    const newFamilyChurchSeats = members.filter((member: SubmittedMember) =>
      Boolean(member.attendingChurch)
    ).length;

    if (newFamilyChurchSeats > familyChurchLimit) {
      return NextResponse.json(
        {
          error: `This family has a church ceremony limit of ${familyChurchLimit} seat${
            familyChurchLimit === 1 ? "" : "s"
          }.`,
        },
        { status: 400 }
      );
    }

    const familiesSnapshot = await adminDb
      .collection("families")
      .where("guestGroup", "==", guestGroup)
      .get();

    const currentGroupChurchSeats = familiesSnapshot.docs.reduce(
      (total, doc) => {
        const data = doc.data();
        return total + Number(data.churchSeatsUsed ?? 0);
      },
      0
    );

    const adjustedGroupChurchSeats =
      currentGroupChurchSeats -
      previousFamilyChurchSeats +
      newFamilyChurchSeats;

    const groupLimit = GROUP_LIMITS[guestGroup];

    if (adjustedGroupChurchSeats > groupLimit) {
      return NextResponse.json(
        {
          error: `Church ceremony seats for this invitation group are full. ${
            guestGroup === "parents"
              ? "Parents' guests"
              : "Bride and groom guests"
          } have a limit of ${groupLimit} seats.`,
        },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    batch.update(familyRef, {
      churchSeatsUsed: newFamilyChurchSeats,
      rsvpStatus: "submitted",
      submittedAt: FieldValue.serverTimestamp(),
    });

    for (const member of members as SubmittedMember[]) {
      const memberRef = familyRef.collection("members").doc(member.id);

      batch.update(memberRef, {
        attendingWedding: Boolean(member.attendingWedding),
        attendingChurch: Boolean(member.attendingChurch),
        contactEmail: member.contactEmail ?? "",
        contactPhone: member.contactPhone ?? "",
        rsvpStatus: "submitted",
        submittedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 }
    );
  }
}