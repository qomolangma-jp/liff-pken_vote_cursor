export async function GET() {
  return Response.json({
    env: {
      hasLiffId: !!process.env.NEXT_PUBLIC_LIFF_ID,
  hasWpBase: !!process.env.NEXT_PUBLIC_WP_API_BASE,
      nodeEnv: process.env.NODE_ENV,
    }
  });
}
