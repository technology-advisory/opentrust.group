
import { jsonResponse, enforceRequest } from '../_lib/forms.js';

export async function onRequest(context) {
  const blocked = enforceRequest(context.request,context.env,{method:'GET'});
  if (blocked) return blocked;

  const siteKey = String(context.env.TURNSTILE_SITE_KEY || '').trim();
  return jsonResponse({
    ok:true,
    turnstileEnabled:Boolean(siteKey && context.env.TURNSTILE_SECRET_KEY),
    turnstileSiteKey:siteKey || null
  },200);
}
