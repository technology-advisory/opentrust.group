import {
  jsonResponse, enforceRequest, readJsonStrict, checkAutomationTraps,
  validateContact, verifyTurnstile, requestId
} from '../_lib/forms.js';
import { deliverMessage } from '../_lib/delivery.js';

export async function onRequest(context) {
  const rid = requestId();
  const blocked = enforceRequest(context.request,context.env,{method:'POST'});
  if (blocked) return blocked;

  const parsed = await readJsonStrict(context.request,16384);
  if (parsed.error) return parsed.error;

  const trap = checkAutomationTraps(parsed.value);
  if (trap) return trap;

  const validated = validateContact(parsed.value);
  if (validated.error) {
    return jsonResponse({ok:false,code:'validation_failed',message:'Revisa los datos introducidos.'},400,{
      'X-Request-ID':rid
    });
  }

  const turnstile = await verifyTurnstile({
    env:context.env,
    request:context.request,
    token:parsed.value.turnstileToken,
    expectedAction:'contact'
  });

  if (!turnstile.ok) {
    return jsonResponse({
      ok:false,
      code:turnstile.configurationError ? 'turnstile_unconfigured' : 'turnstile_failed',
      message:'No se ha podido validar la verificación antiabuso.'
    },turnstile.configurationError ? 503 : 403,{'X-Request-ID':rid});
  }

  const delivered = await deliverMessage({
    env:context.env,
    kind:'contact',
    payload:validated.value,
    requestId:rid
  });

  if (!delivered.ok) {
    const unconfigured = delivered.code === 'delivery_unconfigured';
    return jsonResponse({
      ok:false,
      code:unconfigured ? 'delivery_unconfigured' : 'delivery_failed',
      message:unconfigured
        ? 'El canal de envío todavía no está configurado.'
        : 'No se ha podido procesar la comunicación.'
    },unconfigured ? 503 : 502,{'X-Request-ID':rid});
  }

  return jsonResponse({ok:true,requestId:rid},202,{'X-Request-ID':rid});
}
