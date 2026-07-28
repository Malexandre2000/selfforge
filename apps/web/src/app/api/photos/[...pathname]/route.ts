import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pathname: string[] }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const segments = (await params).pathname;
  // Photos are stored at progress-photos/{userId}/{file} — enforcing that
  // prefix here is what stops one user from viewing another's photo by
  // guessing/editing the path, since the blob store itself is private.
  if (segments[0] !== "progress-photos" || segments[1] !== userId) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(segments.join("/"), { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
