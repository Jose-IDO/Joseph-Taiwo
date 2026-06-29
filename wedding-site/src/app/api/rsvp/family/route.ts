import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function normalizeSurname(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function POST(request: Request) {
  try {
    const { surname } = await request.json();

    if (!surname) {
      return NextResponse.json(
        { error: "Surname is required" },
        { status: 400 }
      );
    }

    const familyId = normalizeSurname(surname);

    const familyRef = adminDb.collection("families").doc(familyId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

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