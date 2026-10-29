import { calcularVA, calcularCorrienteNominal, calcularCorrienteCorregida, seleccionarProteccion, seleccionarConductor, calcularCaidaTension, calcularDesbalanceUVIE } from './ecuacionesUVIE.js';

export const polesOf = a => a.tipoCarga === 'trifasica' ? 3 : a.tipoCarga === 'bifasica' ? 2 : 1;

// Circuit-level edits apply to every member; apparatus-level edits retain membership.
export function actualizarAparatoEnCircuito(aparatos, id, updatedFields) {
  const source = aparatos.find(a=>a.id===id);
  if (!source) return aparatos;
  const sharedKeys=['fase','slot','overrideCable','overrideBreaker','tuberiaTipo','tuberiaDiametro'];
  const shared=Object.fromEntries(Object.entries(updatedFields).filter(([k])=>sharedKeys.includes(k)));
  if (shared.overrideBreaker) shared.circuitoCapacidad=shared.overrideBreaker==='Auto'?null:Number(shared.overrideBreaker);
  if (shared.fase && shared.slot===undefined) shared.slot=null;
  return aparatos.map(a=>{
    if(a.id!==id && (!source.circuitoId || a.circuitoId!==source.circuitoId)) return a;
    const fields={...shared,...(a.id===id?updatedFields:{})};
    if(fields.tipoCarga && fields.tipoCarga!==a.tipoCarga) Object.assign(fields,{circuitoId:null,circuitoOrden:null,circuitoCapacidad:null,slot:null});
    return {...a,...fields,variantes:(a.variantes||[]).map(v=>v.id===a.activaVariantId?{...v,...fields}:v)};
  });
}
const typeOf = p => ['monofasica','bifasica','trifasica'][p-1];
const amps = a => calcularCorrienteNominal(calcularVA(a.watts,a.fp,a.usarVaDirecto),a.tipoCarga);
const wireLimit = a => ({14:15,12:20,10:30,8:40,6:55,4:70}[parseInt(a.overrideCable)] || Infinity);
const limitOf = a => Math.min(wireLimit(a), Number(a.maxProteccionAmps) || Infinity);

export function criterioAparato(a) {
  const name = `${a.tipo} ${a.modelo || ''}`.toLowerCase();
  if(a.circuitoIndependiente === true) return {grupo:'individual', dedicado:true, obligatorio:true, nota:'Independiente exigido en los datos del equipo o por su fabricante.'};
  if(polesOf(a)>1) return {grupo:'individual',dedicado:true,nota:'Independiente recomendado: carga a 220 V con protección multipolar y desconexión conjunta.'};
  if(/aire acondicionado|minisplit|clima|bomba de calor/.test(name)) return {grupo:'individual',dedicado:true,nota:'Independiente recomendado: compresor y arranque; confirmar MCA/MOCP en placa del equipo.'};
  if(/refrig|congel|fabricadora de hielo|enfriador/.test(name)) return {grupo:'individual',dedicado:true,nota:'Independiente recomendado: conservar refrigeración si falla otro aparato y separar arranques del compresor.'};
  if(amps(a)>=9 || /microondas|horno|crepera|calentador|urna|espresso/.test(name)) return {grupo:'individual',dedicado:true,nota:`Independiente recomendado: demanda de ${amps(a).toFixed(2)} A y ciclos de calentamiento; evita compartir la capacidad disponible.`};
  if(/pantalla|monitor|tpv|caja|comput|terminal/.test(name)) return {grupo:'electrónica',dedicado:false,nota:''};
  if(/alumbr|ilumin|luminaria|rótulo|lampara|lámpara|led/.test(name)) return {grupo:'iluminación',dedicado:false,nota:''};
  if(/motor|molino|licuad|extractor|ventilad|batidora/.test(name)) return {grupo:'motores pequeños',dedicado:false,nota:''};
  return {grupo:'contactos',dedicado:false,nota:''};
}

export function evaluarDistribucion(breakers, aparatos, fases=['A','B']) {
  const byId=new Map(aparatos.map(a=>[a.id,a])); const seen=new Set(); const errores=[]; const avisos=[];
  if(new Set(breakers.map(b=>b.id)).size!==breakers.length || breakers.some(b=>!b.id)) errores.push('Cada pastilla debe tener un identificador único.');
  if(byId.size!==aparatos.length) errores.push('Hay identificadores de aparatos repetidos.');
  for(const a of aparatos) if(!Number.isFinite(Number(a.watts)) || Number(a.watts)<0 || !Number.isFinite(Number(a.fp)) || Number(a.fp)<=0 || Number(a.fp)>1) errores.push(`${a.tipo}: potencia o factor de potencia inválido.`);
  const result=breakers.map(b=>{
    const loads=(b.aparatos || []).map(id=>{if(seen.has(id)) errores.push(`Aparato repetido: ${id}`); seen.add(id); return byId.get(id);}).filter(Boolean);
    if((b.aparatos || []).some(id=>!byId.has(id))) errores.push(`${b.circuitoNumero}: aparato desconocido.`);
    const vaTotal=loads.reduce((s,a)=>s+calcularVA(a.watts,a.fp,a.usarVaDirecto),0);
    const inTotal=calcularCorrienteNominal(vaTotal,typeOf(b.polos));
    // Existing project assumption: all loads at 125%. Compare Ic with full breaker rating, not 80% again.
    const icTotal=calcularCorrienteCorregida(inTotal);
    const parts=(b.fase||'').split('-');
    if(parts.length!==b.polos || new Set(parts).size!==parts.length || parts.some(f=>!fases.includes(f)) || loads.some(a=>polesOf(a)!==b.polos)) errores.push(`${b.circuitoNumero}: tensión o polos incompatibles.`);
    if(!Number.isFinite(b.capacidad) || b.capacidad<=0 || icTotal>b.capacidad+0.005) errores.push(`${b.circuitoNumero}: Ic ${icTotal.toFixed(2)} A supera la pastilla de ${b.capacidad} A.`);
    if(loads.some(a=>b.capacidad>limitOf(a))) errores.push(`${b.circuitoNumero}: la protección supera el límite del cable o del equipo registrado.`);
    const policies=loads.map(criterioAparato);
    if(loads.length>1) {
      if(b.capacidad>20) errores.push(`${b.circuitoNumero}: esta herramienta limita los circuitos compartidos a 15/20 A.`);
      if(policies.some(p=>p.obligatorio)) errores.push(`${b.circuitoNumero}: un equipo exige circuito independiente.`);
      if(loads.some(a=>amps(a)>b.capacidad*.8)) errores.push(`${b.circuitoNumero}: una carga supera el 80% de la pastilla; revisar conexión fija o circuito individual (210-23).`);
      // Unknown mounting treated conservatively: any non-lighting equipment may be fixed.
      const fixed=loads.filter((a,i)=>policies[i].grupo!=='iluminación' && a.fijoEnLugar!==false);
      if(fixed.reduce((s,a)=>s+amps(a),0)>b.capacidad*.5 && (fixed.length<loads.length || loads.some(a=>a.fijoEnLugar===undefined))) errores.push(`${b.circuitoNumero}: revisar cargas fijas/portátiles; supera el margen del 50% para combinación de usos (210-23).`);
      if(policies.some(p=>p.dedicado)) avisos.push(`${b.circuitoNumero}: se recomienda separar ${loads.filter((a,i)=>policies[i].dedicado).map(a=>a.tipo).join(', ')}.`);
      if(new Set(policies.map(p=>p.grupo)).size>1) avisos.push(`${b.circuitoNumero}: mezcla de usos; se recomienda separar iluminación, electrónica y motores.`);
    }
    const notas=loads.filter((a,i)=>policies[i].dedicado).map(a=>`${a.tipo}: ${criterioAparato(a).nota}`);
    const conductor=loads.map(a=>a.overrideCable && a.overrideCable!=='Auto'?a.overrideCable:seleccionarConductor(b.capacidad)).sort((a,c)=>parseInt(c)-parseInt(a))[0];
    return {...b,vaTotal,inTotal,icTotal,conductor,esDedicado:loads.length===1&&policies[0]?.dedicado,notas};
  });
  const missing=aparatos.filter(a=>!seen.has(a.id));
  if(missing.length) errores.push(`${missing.length} aparato(s) sin asignar.`);
  return {breakers:result,errores:[...new Set(errores)],avisos:[...new Set(avisos)]};
}

export function moverAparato(breakers, id, targetId, aparatos) {
  const a=aparatos.find(a=>a.id===id); const target=breakers.find(b=>b.id===targetId);
  if(!a || (targetId && !target)) return {error:'Selecciona un aparato y una pastilla válidos.'};
  if(target && target.polos!==polesOf(a)) return {error:'No se puede conectar este aparato: tensión o número de polos incompatible.'};
  return {breakers:breakers.map(b=>({...b,aparatos:[...b.aparatos.filter(x=>x!==id),...(b.id===targetId?[id]:[])]}))};
}

export function calcularDistribucion(aparatos,tipo='bifasico') {
  const fases=tipo==='monofasico'?['A']:tipo==='trifasico'?['A','B','C']:['A','B'];
  const items=[...aparatos].sort((a,b)=>calcularVA(b.watts,b.fp,b.usarVaDirecto)-calcularVA(a.watts,a.fp,a.usarVaDirecto)||String(a.id).localeCompare(String(b.id)));
  const breakers=[];
  for(const a of items) {
    const policy=criterioAparato(a); const polos=polesOf(a);
    let found=false;
    if(!policy.dedicado) for(const b of breakers) {
      if(b.grupo!==policy.grupo || b.esDedicado || b.polos!==polos) continue;
      const ids=[...b.aparatos,a.id]; const loads=items.filter(x=>ids.includes(x.id));
      const ic=calcularCorrienteCorregida(loads.reduce((s,x)=>s+amps(x),0));
      const capacidad=seleccionarProteccion(ic);
      const candidate={...b,aparatos:ids,capacidad};
      if(evaluarDistribucion([candidate],loads,fases).errores.length===0) {Object.assign(b,candidate);found=true;break;}
    }
    if(!found) breakers.push({id:`auto-${a.id}`,circuitoNumero:`C-${breakers.length+1}`,aparatos:[a.id],polos,fase:fases.slice(0,polos).join('-'),capacidad:seleccionarProteccion(calcularCorrienteCorregida(amps(a))),grupo:policy.grupo,esDedicado:policy.dedicado});
  }
  let enriched=evaluarDistribucion(breakers,aparatos,fases).breakers;
  // Exhaustive phase search for ordinary panels; bounded search with a greedy incumbent for large ones.
  const options=b=>b.polos===1?fases:b.polos===2?(fases.length===3?['A-B','A-C','B-C']:['A-B']):['A-B-C'];
  const totals={A:0,B:0,C:0}; const greedy=[];
  for(const b of enriched) {const opts=options(b); const f=[...opts].sort((a,c)=>a.split('-').reduce((s,x)=>s+totals[x],0)-c.split('-').reduce((s,x)=>s+totals[x],0))[0]; greedy.push(f); f.split('-').forEach(x=>totals[x]+=b.vaTotal/b.polos);}
  const score=t=>Math.max(...fases.map(f=>t[f]))-Math.min(...fases.map(f=>t[f]));
  let best=score(totals), assignment=greedy, nodes=0, limited=false;
  function search(i,t,chosen) {
    if(++nodes>200000) {limited=true;return;}
    if(i===enriched.length) {const s=score(t);if(s<best-1e-8) {best=s;assignment=[...chosen];}return;}
    const b=enriched[i];
    for(const f of options(b)) {const next={...t};f.split('-').forEach(x=>next[x]+=b.vaTotal/b.polos);search(i+1,next,[...chosen,f]);if(limited)return;}
  }
  if(fases.length>1) search(0,{A:0,B:0,C:0},[]);
  enriched=enriched.map((b,i)=>({...b,fase:assignment[i]}));
  const final=evaluarDistribucion(enriched,aparatos,fases);
  const fasesVA={A:0,B:0,C:0}; final.breakers.forEach(b=>b.fase.split('-').forEach(f=>fasesVA[f]+=b.vaTotal/b.polos));
  return {...final,fasesVA,desbalancePct:calcularDesbalanceUVIE(fasesVA.A,fasesVA.B,fasesVA.C,tipo),busquedaCompleta:!limited};
}

export function aplicarDistribucion(aparatos,breakers,fases) {
  const evaluation=evaluarDistribucion(breakers,aparatos,fases);
  if(evaluation.errores.length) throw new Error(evaluation.errores.join(' '));
  const active=evaluation.breakers.filter(b=>b.aparatos.length);
  return aparatos.map(a=>{
    const i=active.findIndex(b=>b.aparatos.includes(a.id));
    if (i === -1 || !active[i]) return a;
    const b=active[i];
    return {...a,circuitoId:b.id,circuitoOrden:i,circuitoCapacidad:b.capacidad,fase:b.fase,overrideBreaker:String(b.capacidad),slot:null};
  });
}


// Shared branch model: aggregate once, retain individual calculated loads for labels/editing.
export function agruparCircuitos(cargas,alimPrincipal,fases=['A','B']) {
  const groups=new Map();
  cargas.forEach(c=>{const id=c.circuitoId||`project-${c.id}`;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(c);});
  const circuits = [...groups.entries()].sort((a,b)=>(a[1][0].circuitoOrden??a[1][0].index)-(b[1][0].circuitoOrden??b[1][0].index)).map(([id,loads],index)=>{
    const first=loads[0]; const va=loads.reduce((s,a)=>s+a.va,0), watts=loads.reduce((s,a)=>s+a.watts,0);
    const inNom=calcularCorrienteNominal(va,first.tipoCarga),icCorr=calcularCorrienteCorregida(inNom);
    const breaker=first.circuitoCapacidad || (first.overrideBreaker==='Auto'?seleccionarProteccion(icCorr):first.breaker);
    const conductor=loads.length===1?first.conductor:loads.map(a=>a.conductor).sort((a,b)=>parseInt(b)-parseInt(a))[0]||seleccionarConductor(breaker);
    const longitudMetros=Math.max(...loads.map(a=>a.longitudMetros));
    const caida=loads.length===1?first.caida:calcularCaidaTension(longitudMetros,inNom,first.tipoCarga,conductor);
    const num=`C-${index+1}`;
    const caidaTotal=caida+(alimPrincipal?.caida||0);
    return {...first,id,num,loads:loads.map(a=>({...a,num,breaker,conductor,caida,caidaTotal,circuitoAparatos:loads.length,circuitoIc:icCorr})),aparatos:loads.map(a=>a.id),watts,va,fp:va?watts/va:1,usarVaDirecto:false,inNom,icCorr,breaker,conductor,overrideBreaker:String(breaker),overrideCable:conductor,longitudMetros,caida,caidaTotal,tipo:loads.map(a=>a.tipo).join(' / '),desc:loads.map(a=>a.tipo).join(' / '),modelo:loads.length===1?first.modelo:'Circuito compartido',interruptorStr:`${polesOf(first)}x${breaker}A`,conductorStr:`${polesOf(first)===1?2:polesOf(first)} # ${parseInt(conductor)} + 1 # ${parseInt(conductor)} T`};
  });
  // A shared branch gets one position, including when balancing clears old slots.
  // All consuming modules receive this same placement; no apparatus is hidden for a null slot.
  const occupied=new Set();
  const phaseAt=slot=>fases[(Math.ceil(slot/2)-1)%fases.length];
  return circuits.map(c=>{
    const poles=polesOf(c);
    const requested=(c.fase||fases[0]).split('-').sort().join('-');
    const fits=slot=>Array.from({length:poles},(_,i)=>slot+2*i).every(s=>!occupied.has(s)) && Array.from({length:poles},(_,i)=>phaseAt(slot+2*i)).sort().join('-')===requested;
    let slot=Number.isInteger(c.slot)&&c.slot>0&&fits(c.slot)?c.slot:1;
    while(!fits(slot)&&slot<1000) slot++;
    if(slot>=1000) return {...c,slot:null};
    for(let p=0;p<poles;p++) occupied.add(slot+2*p);
    return {...c,slot,loads:c.loads.map(a=>({...a,slot}))};
  });
}
