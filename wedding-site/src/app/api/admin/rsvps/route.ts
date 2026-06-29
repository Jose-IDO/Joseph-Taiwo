import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type FirestoreTimestamp = {
  toDate: () => Date;
};

type MemberData = {
  fullName?: string;
  attendingWedding?: boolean;
  attendingChurch?: boolean;
  churchEligible?: boolean;
  rsvpStatus?: string;
  submittedAt?: FirestoreTimestamp;
};

type FamilyData = {
  surname?: string;
  familyNameKey?: string;
  guestGroup?: "bride-groom" | "parents";
  contactEmail?: string;
  contactPhone?: string;
  rsvpStatus?: string;
  churchSeatLimit?: number;
  churchSeatsUsed?: number;
  submittedAt?: FirestoreTimestamp;
};

function timestampToISOString(timestamp?: FirestoreTimestamp) {
  if (!timestamp) return null;

  return timestamp.toDate().toISOString();
}

export async function GET() {
  try {
    const familiesSnapshot = await adminDb.collection("families").get();

    const families = await Promise.all(
      familiesSnapshot.docs.map(async (familyDoc) => {
        const familyData = familyDoc.data() as FamilyData;
        const membersSnapshot = await familyDoc.ref.collection("members").get();

        const members = membersSnapshot.docs.map((memberDoc) => {
          const memberData = memberDoc.data() as MemberData;

          return {
            id: memberDoc.id,
            fullName: memberData.fullName ?? "",
            attendingWedding: Boolean(memberData.attendingWedding),
            attendingChurch: Boolean(memberData.attendingChurch),
            churchEligible: memberData.churchEligible !== false,
            rsvpStatus: memberData.rsvpStatus ?? "pending",
            submittedAt: timestampToISOString(memberData.submittedAt),
          };
        });

        return {
          id: familyDoc.id,
          surname: familyData.surname ?? familyDoc.id,
          familyNameKey: familyData.familyNameKey ?? familyDoc.id,
          guestGroup: familyData.guestGroup ?? "bride-groom",
          contactEmail: familyData.contactEmail ?? "",
          contactPhone: familyData.contactPhone ?? "",
          rsvpStatus: familyData.rsvpStatus ?? "pending",
          submittedAt: timestampToISOString(familyData.submittedAt),
          churchSeatLimit: familyData.churchSeatLimit ?? 0,
          churchSeatsUsed: familyData.churchSeatsUsed ?? 0,
          members,
        };
      })
    );

    const totals = families.reduce(
      (summary, family) => {
        const invited = family.members.length;
        const reception = family.members.filter(
          (member) => member.attendingWedding
        ).length;
        const church = family.members.filter(
          (member) => member.attendingChurch
        ).length;

        summary.totalFamilies += 1;
        summary.totalInvited += invited;
        summary.receptionAttending += reception;
        summary.churchAttending += church;

        if (family.rsvpStatus === "submitted") {
          summary.submittedFamilies += 1;
        } else {
          summary.pendingFamilies += 1;
        }

        if (family.guestGroup === "parents") {
          summary.parentsChurch += church;
        } else {
          summary.brideGroomChurch += church;
        }

        return summary;
      },
      {
        totalFamilies: 0,
        submittedFamilies: 0,
        pendingFamilies: 0,
        totalInvited: 0,
        receptionAttending: 0,
        churchAttending: 0,
        brideGroomChurch: 0,
        parentsChurch: 0,
      }
    );

    const rsvpCompletion =
      totals.totalFamilies === 0
        ? 0
        : Math.round((totals.submittedFamilies / totals.totalFamilies) * 100);

    return NextResponse.json({
      totals: {
        ...totals,
        rsvpCompletion,
        brideGroomChurchLimit: 50,
        parentsChurchLimit: 50,
        totalChurchLimit: 100,
      },
      families,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load RSVP dashboard" },
      { status: 500 }
    );
  }
}