export function checkInEmail(name: string, checkInUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Daily Check-In is ready</title>
</head>
<body style="margin:0;padding:0;background-color:#FFFDF8;font-family:Arial,Helvetica,sans-serif;color:#111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFDF8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#FFFDF8;border-radius:16px;padding:48px 40px;text-align:left;">
              <p style="font-size:28px;font-weight:700;color:#E1446F;margin:0 0 8px 0;">Action for Happiness</p>
              <h1 style="font-size:24px;font-weight:700;color:#111111;margin:0 0 24px 0;">
                Your Daily Check-In is ready, ${name} 🌱
              </h1>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0 0 16px 0;">
                Take a moment just for you. A few minutes to breathe, reflect on how you're feeling, notice what you're grateful for, and set a small intention for today.
              </p>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0 0 32px 0;">
                Ready when you are.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="background-color:#E1446F;border-radius:8px;padding:0;">
                    <a href="${checkInUrl}" style="display:inline-block;padding:16px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Start your check-in
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;margin:0 0 8px 0;">
                Or copy this link into your browser:
              </p>
              <p style="font-size:13px;color:#E1446F;word-break:break-all;margin:0;">
                ${checkInUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="font-size:13px;color:#888;margin:0;">
                You're receiving this because you signed up at Action for Happiness.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
