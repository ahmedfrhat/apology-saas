import sql from "@/app/api/utils/sql";

async function runAnniversary(request) {
  const url = new URL(request.url);
  const secretQuery = url.searchParams.get("secret");
  const authHeader = request.headers.get("Authorization");
  const secretHeader = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  const cronSecret = process.env.CRON_SECRET || "apology-cron-secret-2026";
  const providedSecret = secretQuery || secretHeader;

  if (!providedSecret || providedSecret !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Select all sites celebrating an anniversary today (excluding same year)
    const anniversarySites = await sql`
      SELECT id, slug, creator_email, config, reconciled_at 
      FROM apology_sites
      WHERE reconciled_at IS NOT NULL
        AND EXTRACT(MONTH FROM reconciled_at) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(DAY FROM reconciled_at) = EXTRACT(DAY FROM NOW())
        AND EXTRACT(YEAR FROM reconciled_at) < EXTRACT(YEAR FROM NOW())
    `;

    const resendApiKey = process.env.RESEND_API_KEY;
    const sentSlugs = [];

    if (resendApiKey) {
      for (const site of anniversarySites) {
        if (!site.creator_email) continue;
        const boyName = site.config?.boyName || "الزوج";
        const girlName = site.config?.girlName || "الزوجة";
        const yearsDiff = new Date().getFullYear() - new Date(site.reconciled_at).getFullYear();

        const emailHtml = `
          <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e0d8; border-radius: 20px; background-color: #FCFBF7; color: #4A3E3D;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 40px;">💖🎉</span>
              <h1 style="color: #92400E; margin-top: 10px; font-size: 24px;">ذكرى صلح سعيدة!</h1>
              <p style="font-size: 14px; color: #8A7E7D;">مرت سنة كاملة منذ صلحكما التاريخي على Safi.io!</p>
            </div>

            <div style="background-color: #ffffff; padding: 20px; border-radius: 15px; border: 1px solid #1a1a1a10; margin-bottom: 20px; line-height: 1.6;">
              <p>مرحباً يا <b>${boyName}</b>،</p>
              <p>نأمل أن تكونوا في أفضل حال وسعادة كاملة اليوم! يصادف اليوم <b>مرور ${yearsDiff} عاماً</b> على اليوم الذي تصالحت فيه مع <b>${girlName}</b> وسامحتك بنجاح. 🤍</p>
              <p>أردنا فقط أن نلقي التحية السنوية ونتمنى لكما علاقة مليئة بالفرح والتفاهم الدائم، خالية من أي خلافات.</p>
              <p style="margin-top: 15px;">إذا كنتما تريدان استرجاع ذكريات الصداقة والصلح، يمكنكما دائماً زيارة الرابط الخاص بكما:</p>
              <p style="text-align: center; margin: 15px 0;">
                <a href="https://safi.io/${site.slug}" style="display: inline-block; padding: 10px 20px; background-color: #B45309; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: bold;">زيارة صفحة الذكريات 🔑</a>
              </p>
            </div>

            <div style="text-align: center; font-size: 11px; color: #8A7E7D; border-top: 1px solid #eee; padding-top: 15px;">
              <p>© 2026 Safi.io - جميع الحقوق محفوظة. بريد تذكاري آلي سنوي مستمر.</p>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Safi.io <onboarding@resend.dev>",
            to: site.creator_email,
            subject: `🎉 ذكرى صلح سعيدة! مرور عام على صلحك مع ${girlName}`,
            html: emailHtml
          })
        }).then(() => {
          sentSlugs.push(site.slug);
        }).catch(err => {
          console.error(`Failed to send anniversary email for slug: ${site.slug}`, err);
        });
      }
    }

    return Response.json({
      success: true,
      processedAnniversariesCount: anniversarySites.length,
      sentAnniversaries: sentSlugs
    });
  } catch (error) {
    console.error("[cron/anniversary] error", error);
    return Response.json({ error: "Failed to process anniversary pipeline" }, { status: 500 });
  }
}

export async function GET(request) {
  return runAnniversary(request);
}

export async function POST(request) {
  return runAnniversary(request);
}
