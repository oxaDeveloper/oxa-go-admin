import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const imgurFormData = new FormData();
    imgurFormData.append("image", image);

    const response = await axios.post(
      "https://api.imgur.com/3/image",
      imgurFormData,
      {
        headers: {
          Authorization: `Client-ID d9b5f72e854e2e3`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Upload error:", error);

    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
