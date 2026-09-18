export function welcomeEmail(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to your Daily Check-In</title>
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
                Welcome, ${name}! 🌱
              </h1>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0 0 16px 0;">
                You've taken a wonderful step — and we're so glad you're here.
              </p>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0 0 16px 0;">
                Every day, we'll send you a gentle check-in to help you pause, reflect, and set a small intention. It only takes a few minutes, but those minutes can make a real difference.
              </p>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0 0 32px 0;">
                Keep an eye on your inbox — your first daily check-in is on its way.
              </p>
              <p style="font-size:16px;line-height:1.6;color:#111111;margin:0;">
                With warmth,<br />
                <strong>The Action for Happiness team</strong>
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
