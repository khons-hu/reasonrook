import {languages} from './languages.mjs';
export const VERSION=1;
export function blank(){return {version:VERSION,selected:'repeat',theme:globalThis.matchMedia?.('(prefers-color-scheme: light)').matches?'light':'dark',attempts:{}};}
export function newAttempt(){return {notes:'',code:null,language:'javascript',drafts:{},reflection:'',hints:0,review:false,done:false,revisit:false,checks:[]};}
export function validate(raw,ids){
 if(!raw||typeof raw!=='object'||raw.version!==VERSION||!raw.attempts||typeof raw.attempts!=='object'||Array.isArray(raw.attempts))throw Error('This is not a Reasonrook v1 backup.');
 const result=blank();result.selected=ids.includes(raw.selected)?raw.selected:ids[0];result.theme=raw.theme==='dark'||raw.theme==='light'?raw.theme:result.theme;
 for(const [id,a] of Object.entries(raw.attempts)){
  if(!ids.includes(id))continue;
  if(!a||typeof a!=='object'||Array.isArray(a))throw Error('An exercise entry is invalid.');
  const out=newAttempt();for(const key of ['notes','code','reflection']){if(key==='code'&&(a[key]===null||a[key]===undefined)){out.code=null;continue;}if(a[key]!==undefined&&typeof a[key]!=='string')throw Error('A draft field is invalid.');out[key]=(a[key]||'').slice(0,20000);}
  out.language=languages.some(l=>l.id===a.language)?a.language:'javascript';
  if(a.drafts&&typeof a.drafts==='object'&&!Array.isArray(a.drafts)){for(const l of languages){if(l.id!=='javascript'&&typeof a.drafts[l.id]==='string')out.drafts[l.id]=a.drafts[l.id].slice(0,20000);}}
  out.hints=Number.isInteger(a.hints)?Math.max(0,Math.min(3,a.hints)):0;
  for(const key of ['review','done','revisit'])out[key]=a[key]===true;
  out.checks=Array.isArray(a.checks)?a.checks.filter(v=>Number.isInteger(v)&&v>=0&&v<3):[];
  result.attempts[id]=out;
 }
 return result;
}
export function filtered(exercises,track,query,state,queue=false){const q=query.trim().toLowerCase();return exercises.filter(e=>(track==='all'||e.track===track)&&(!queue||state.attempts[e.id]?.revisit)&&(!q||`${e.title} ${e.concept} ${e.brief}`.toLowerCase().includes(q)));}
