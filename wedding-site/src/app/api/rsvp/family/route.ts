import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function normalizeSurname(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const { surname, guestGroup } = await request.json();

    if (!surname || !guestGroup) {
      return NextResponse.json(
        { error: "Surname and guest group are required" },
        { status: 400 }
      );
    }

    const familyNameKey = normalizeSurname(surname);

    const familiesSnapshot = await adminDb
      .collection("families")
      .where("familyNameKey", "==", familyNameKey)
      .where("guestGroup", "==", guestGroup)
      .limit(1)
      .get();

    if (familiesSnapshot.empty) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    const familyDoc = familiesSnapshot.docs[0];
    const familyRef = familyDoc.ref;

    const membersSnapshot = await familyRef.collection("members").get();

    const members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      family: {
        id: familyDoc.id,
        ...familyDoc.data(),
      },
      members,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch family" },
      { status: 500 }
    );
  }
}