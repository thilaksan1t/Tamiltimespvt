const json = (x, s = 200) =>
  new Response(JSON.stringify(x), {
    status: s,
    headers: { "content-type": "application/json; charset=UTF-8" }
  });

async function b64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let out = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    out += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return btoa(out);
}

const esc = (v) => String(v ?? "").replace(/[<>&"']/g, c => ({
  "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;", "'":"&#39;"
}[c]));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/apply" && request.method === "POST") {
      try {
        if (!env.RESEND_API_KEY) {
          return json({ error: "Email service is not configured." }, 500);
        }

        const form = await request.formData();
        const required = ["fullName", "nic", "mobile", "address", "nicFront", "nicBack", "selfie"];
        for (const key of required) {
          const value = form.get(key);
          if (!value || (typeof value === "string" && !value.trim())) {
            return json({ error: "Please complete all required fields." }, 400);
          }
        }

        const files = [];
        for (const key of ["nicFront", "nicBack", "selfie", "extra"]) {
          const file = form.get(key);
          if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
            if (file.size > 7340032) {
              return json({ error: "Each uploaded file must be 7 MB or smaller." }, 400);
            }
            files.push({
              filename: file.name || key,
              content: await b64(file)
            });
          }
        }

        const value = key => form.get(key) || "";
        const fields = ["fullName","nic","mobile","email","address","occupation","income","product","amount"];
        const html =
          "<h2>New TamilTimes Finance Application</h2>" +
          fields.map(key => `<p><b>${esc(key)}:</b> ${esc(value(key))}</p>`).join("");

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: env.FROM_EMAIL || "onboarding@resend.dev",
            to: [env.TO_EMAIL || "thilaksan1t@gmail.com"],
            subject: `New Finance Application - ${value("fullName")}`,
            html,
            attachments: files
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return json({ error: data.message || "Email service rejected the application." }, 502);
        }

        return json({ ok: true });
      } catch (error) {
        return json({ error: "Unable to submit. Please try again." }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
