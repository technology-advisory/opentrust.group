let cachedAccessToken = '';
let cachedAccessTokenExpiresAt = 0;

function line(v,max=240){
  return String(v??'')
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g,' ')
    .replace(/[\u0000-\u001F\u007F]/g,'')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
}

function multi(v,max=7000){
  return String(v??'')
    .normalize('NFKC')
    .replace(/\u0000/g,'')
    .replace(/\r\n?/g,'\n')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'')
    .trim()
    .slice(0,max);
}

function req(env,n){
  const v=String(env[n]||'').trim();
  if(!v) throw new Error('missing_'+n.toLowerCase());
  return v;
}

function envEmail(env,n){
  const v=req(env,n);
  if(v.length>254 || /[\r\n]/.test(v) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v)){
    throw new Error('missing_'+n.toLowerCase());
  }
  return v;
}

function envAccountId(env){
  const v=req(env,'ZOHO_ACCOUNT_ID');
  if(!/^\d{8,32}$/.test(v)){
    throw new Error('missing_zoho_account_id');
  }
  return v;
}

async function timed(url,options,ms){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),ms);
  try{
    return await fetch(url,{...options,signal:controller.signal});
  }finally{
    clearTimeout(timeout);
  }
}

async function accessToken(env){
  const now=Date.now();
  if(cachedAccessToken && cachedAccessTokenExpiresAt>now+60000){
    return cachedAccessToken;
  }

  const body=new URLSearchParams({
    refresh_token:req(env,'ZOHO_REFRESH_TOKEN'),
    client_id:req(env,'ZOHO_CLIENT_ID'),
    client_secret:req(env,'ZOHO_CLIENT_SECRET'),
    grant_type:'refresh_token'
  });

  const response=await timed('https://accounts.zoho.eu/oauth/v2/token',{
    method:'POST',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded',
      'Accept':'application/json'
    },
    body
  },5000);

  const data=await response.json().catch(()=>({}));
  if(!response.ok || !data.access_token){
    throw new Error('delivery_auth_failed');
  }

  cachedAccessToken=String(data.access_token);
  cachedAccessTokenExpiresAt=now+Math.max(300,Number(data.expires_in||3600))*1000;
  return cachedAccessToken;
}

const topicLabels={
  architecture:'Arquitectura e infraestructura',
  cybersecurity:'Ciberseguridad',
  grc:'GRC, cumplimiento y regulación',
  resilience:'Resiliencia y continuidad',
  ai:'Inteligencia Artificial',
  applications:'Aplicaciones OpenTrust',
  collaboration:'Colaboración profesional',
  legal_privacy:'Legal, privacidad o ejercicio de derechos',
  other:'Otra consulta'
};

const securityLabels={
  vulnerability:'Posible vulnerabilidad',
  exposure:'Exposición de información',
  configuration:'Configuración de seguridad',
  suspicious:'Comportamiento sospechoso',
  other:'Otro asunto de seguridad'
};


function html(v){
  return String(v??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function htmlMultiline(v,max){
  return html(multi(v,max)).replace(/\n/g,'<br>');
}

function row(label,value){
  return `<tr>
    <td style="padding:8px 12px 8px 0;width:155px;vertical-align:top;color:#64748b;font-size:13px;font-weight:600;">${html(label)}</td>
    <td style="padding:8px 0;vertical-align:top;color:#0f172a;font-size:14px;line-height:1.55;word-break:break-word;">${value}</td>
  </tr>`;
}

function emailShell({eyebrow,title,accent,summary,details,messageLabel,message,requestId}){
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${html(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f7fb;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#0f172a;">
              <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#cbd5e1;font-weight:700;">OpenTrust Group</div>
              <div style="margin-top:8px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${accent};font-weight:700;">${html(eyebrow)}</div>
              <div style="margin-top:8px;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">${html(title)}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.55;color:#cbd5e1;">${html(summary)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${details}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 24px;">
              <div style="margin-bottom:8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;">${html(messageLabel)}</div>
              <div style="padding:16px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;color:#0f172a;font-size:14px;line-height:1.65;word-break:break-word;">${message}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e5e7eb;">
              <div style="font-size:11px;line-height:1.5;color:#94a3b8;">
                Mensaje generado automáticamente desde opentrust.group · Request ID: ${html(requestId)}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function build(kind,p,id){
  if(kind==='security-report'){
    const type=securityLabels[p.type]||'Asunto de seguridad';
    const details=[
      row('Tipo',html(type)),
      row('Nombre o alias',html(line(p.name,80)||'No indicado')),
      row('Email de respuesta',html(line(p.email,254))),
      row('Activo / URL',html(line(p.asset,500)||'No indicado'))
    ].join('');

    return {
      subject:`[OpenTrust Security] ${type}`,
      content:emailShell({
        eyebrow:'Security · Responsible Disclosure',
        title:'Nuevo reporte de seguridad',
        accent:'#f59e0b',
        summary:'Se ha recibido una nueva comunicación a través del canal de seguridad de OpenTrust Group.',
        details,
        messageLabel:'Descripción',
        message:htmlMultiline(p.message,6000),
        requestId:id
      })
    };
  }

  const topic=topicLabels[p.topic]||'Consulta';
  const details=[
    row('Tipo',html(topic)),
    row('Nombre',html(line(p.name,80))),
    row('Email de respuesta',html(line(p.email,254))),
    row('Organización',html(line(p.organization,120)||'No indicada')),
    row('Asunto',html(line(p.subject,140)))
  ].join('');

  return {
    subject:`[OpenTrust] ${topic} — ${line(p.subject,140)}`,
    content:emailShell({
      eyebrow:'Contacto',
      title:'Nueva comunicación',
      accent:'#38bdf8',
      summary:'Se ha recibido una nueva consulta desde el formulario de contacto de OpenTrust Group.',
      details,
      messageLabel:'Mensaje',
      message:htmlMultiline(p.message,4000),
      requestId:id
    })
  };
}

export async function deliverMessage({env,kind,payload,requestId}){
  if(String(env.FORM_DELIVERY_ENABLED||'false').toLowerCase()!=='true'){
    return {ok:false,code:'delivery_unconfigured'};
  }

  try{
    const accountId=envAccountId(env);
    const fromAddress=envEmail(env,'ZOHO_FROM_ADDRESS');
    const contactTo=env.CONTACT_TO_ADDRESS ? envEmail(env,'CONTACT_TO_ADDRESS') : fromAddress;
    const securityTo=env.SECURITY_TO_ADDRESS ? envEmail(env,'SECURITY_TO_ADDRESS') : contactTo;
    const mail=build(kind,payload,requestId);
    const token=await accessToken(env);

    const response=await timed(
      `https://mail.zoho.eu/api/accounts/${encodeURIComponent(accountId)}/messages`,
      {
        method:'POST',
        headers:{
          'Accept':'application/json',
          'Content-Type':'application/json',
          'Authorization':`Zoho-oauthtoken ${token}`
        },
        body:JSON.stringify({
          fromAddress,
          toAddress:kind==='security-report'?securityTo:contactTo,
          subject:mail.subject,
          content:mail.content,
          mailFormat:'html',
          askReceipt:'no',
          encoding:'UTF-8'
        })
      },
      7000
    );

    const data=await response.json().catch(()=>({}));
    const code=Number(data?.status?.code||0);

    if(!response.ok || (code&&code>=400)){
      return {ok:false,code:'delivery_failed'};
    }

    return {ok:true};
  }catch(error){
    const message=String(error?.message||'');
    if(message.startsWith('missing_')){
      return {ok:false,code:'delivery_unconfigured'};
    }
    return {ok:false,code:'delivery_failed'};
  }
}
