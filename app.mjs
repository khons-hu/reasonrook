import {exerciseMessages} from './exercise-messages.mjs';
import {t,number,locales,getLocale,setLocale,applyLocale} from './i18n.mjs';
import {languages,activeLanguage,starter,draft,setDraft} from './languages.mjs';
import {resources} from './runtime-loader.mjs';
import {tracks,exercises} from './content.mjs';
import {blank,newAttempt,validate,filtered} from './core.mjs';
const $=id=>document.getElementById(id),ids=exercises.map(e=>e.id),key='thinkroom-v1';
let importFeedback=null;
let state=blank(),track='all',query='',queue=false,runId=0,runnerReady=false,runTimer,activeRun=null,pendingImport;
try{const saved=localStorage.getItem(key);if(saved)state=validate(JSON.parse(saved),ids);}catch{$('save-state').textContent=t('Saved data could not be loaded. Export or keep a backup.');}
const themePreference=matchMedia('(prefers-color-scheme: light)');
function renderTheme(){
 const theme=state.theme||(themePreference.matches?'light':'dark');
 document.documentElement.dataset.theme=theme;
 $('theme').textContent=theme==='light'?'☾':'☀';
 const label=t(theme==='light'?'Switch to dark theme':'Switch to light theme');
 $('theme').setAttribute('aria-label',label);$('theme').title=label;
 document.querySelector('meta[name="theme-color"]').setAttribute('content',theme==='light'?'#e7ebef':'#0b111a');
}
themePreference.addEventListener('change',()=>{if(!state.theme)renderTheme();});
addEventListener('storage',event=>{
 if(event.key!==key&&event.key!==null)return;
 try{const theme=JSON.parse(event.newValue||'{}')?.theme;state.theme=theme==='light'||theme==='dark'?theme:null;renderTheme();}catch{}
});
const languagePicker=$('ui-language');
for(const [value,label] of Object.entries(locales)){const option=document.createElement('option');option.value=value;option.textContent=label;languagePicker.append(option);}
languagePicker.value=getLocale();applyLocale();
languagePicker.addEventListener('change',()=>{const results=[...$('test-results').childNodes],referenceOpen=$('reference').open;setLocale(languagePicker.value);applyLocale();render();$('test-results').replaceChildren(...results);$('reference').open=referenceOpen;if(importFeedback)text('import-status',t(importFeedback.key,importFeedback.params));save();});
const localizedExercise=e=>({...e,...exerciseMessages[getLocale()]?.[e.id]});
const current=()=>localizedExercise(exercises.find(e=>e.id===state.selected)||exercises[0]);
const attempt=()=>state.attempts[state.selected]??=(newAttempt());
function save(){try{localStorage.setItem(key,JSON.stringify(state));$('save-state').textContent=t('Saved on this device');}catch{$('save-state').textContent=t('Browser storage is unavailable or full. Export a backup.');}}
function text(id,value){$(id).textContent=t(value);}
function importStatus(key,params={}){importFeedback={key,params};text('import-status',t(key,params));}
function button(label,handler,className=''){const b=document.createElement('button');b.textContent=label;b.className=className;b.addEventListener('click',handler);return b;}
function renderLibrary(){
 $('tracks').replaceChildren(...tracks.map(t=>{const b=button(`${t.icon}  ${translateTrack(t.name)}`,()=>{track=t.id;renderLibrary();});b.setAttribute('aria-pressed',String(track===t.id));return b;}));
 const matches=filtered(exercises.map(localizedExercise),track,query,state,queue);text('result-count',t('{count} exercises',{count:number(matches.length)}));text('progress',t('{count} reviewed',{count:number(Object.values(state.attempts).filter(a=>a.done).length)}));text('queue-count',Object.values(state.attempts).filter(a=>a.revisit).length);
 $('queue').setAttribute('aria-pressed',String(queue));
 const cards=matches.map(e=>{const b=button('',()=>select(e.id));b.className='exercise-card';b.setAttribute('aria-current',String(state.selected===e.id));const tag=document.createElement('span');tag.className='card-tag';tag.textContent=`${t(e.level)} · ${number(e.minutes)} min${state.attempts[e.id]?.done?' · '+t('Reviewed ✓'):''}`;const title=document.createElement('strong');title.textContent=e.title;const sub=document.createElement('span');sub.className='card-concept';sub.textContent=e.concept;b.append(tag,title,sub);return b;});
 if(!cards.length){const p=document.createElement('p');p.className='empty';p.textContent=t(queue?'Nothing here yet. Save an exercise for another round.':'No matches. Try a different word or track.');cards.push(p);}
 $('exercise-list').replaceChildren(...cards);
}
function select(id){if(!ids.includes(id))return;cancelRun();state.selected=id;save();render();$('workspace').focus({preventScroll:true});if(matchMedia('(max-width: 850px)').matches)$('workspace').scrollIntoView({behavior:'instant'});}
function renderLanguage(){
 const l=activeLanguage(attempt());$('language').value=l.id;$('run').hidden=!l.runnable;$('run').disabled=!!activeRun||!runnerReady;
 $('external-runner').hidden=l.runnable;if(l.url){$('external-runner').href=l.url;text('external-runner',t('Open {runner} ↗',{runner:l.runner}));}
 text('run',l.id==='c'||l.id==='cpp'?'Compile & run':'Run checks');
 text('runner-note',l.id==='c'||l.id==='cpp'?'Local compilation · 2-second execution limit · write your tests in main()':l.runnable?'Local execution · 2-second code limit · sample checks only':'No in-app compiler for this language.');
 text('language-note',l.id==='c'||l.id==='cpp'?'Experimental browser Clang 8: C11 / C++17. About 60 MB on first run. Runs your whole program, not automatic exercise checks. Print or assert test cases in main(). No network, packages, threads or interactive input.':l.id==='typescript'?'TypeScript is transpiled, not type-checked. Single-file functions only; no package imports.':l.id==='python'?'Python runs in your browser. First run downloads about 14 MB of runtime files from this site. No pip packages. Use None for null and a default parameter for an omitted argument.':l.runnable?'Write a function named solve. Nothing is sent to an execution server.':t('Write and save your {language} attempt here, then download it or copy it into {runner}. The external service runs code only after you submit it there. No automatic transfer or grading.',{language:l.label,runner:l.runner}));
}
$('download-code').addEventListener('click',()=>{const l=activeLanguage(attempt()),url=URL.createObjectURL(new Blob([$('code').value],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download=`thinkroom-${current().id}.${l.ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function renderHints(){const a=attempt(),e=current();$('hints').replaceChildren(...e.hints.slice(0,a.hints).map(h=>{const li=document.createElement('li');li.textContent=h;return li;}));text('hint-count',`${a.hints}/3`);$('hint').disabled=a.hints>=e.hints.length;}
function renderReview(){const a=attempt(),e=current();$('review-panel').hidden=!a.review;$('review-toggle').setAttribute('aria-expanded',String(a.review));text('solution',e.solution);$('reference').hidden=!e.reference; $('reference').open=false;text('reference-code',e.reference||'');$('rubric').replaceChildren(...e.rubric.map((r,i)=>{const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=a.checks.includes(i);input.addEventListener('change',()=>{a.checks=input.checked?[...new Set([...a.checks,i])]:a.checks.filter(n=>n!==i);save();});const span=document.createElement('span');span.textContent=r;label.append(input,span);return label;}));$('reflection').value=a.reflection;text('complete',a.done?'Reviewed ✓ · Undo':'Mark reviewed ✓');}
const translateTrack=name=>t(name);
function render(){
 $('content-language-note').hidden=getLocale()==='en';
 const e=current(),a=attempt();text('exercise-category',tracks.find(t=>t.id===e.track).name);text('exercise-number',String(ids.indexOf(e.id)+1).padStart(2,'0'));text('title',e.title);text('difficulty',e.level);text('time',`${number(e.minutes)} min`);text('concept',e.concept);text('brief',e.brief);text('example',e.example);text('constraints',e.constraint);
 $('source').hidden=!e.source;if(e.source){$('source').href=e.source.url;text('source',t('Explore further: {label} ↗',{label:e.source.label}));}else $('source').removeAttribute('href');
 $('notes').value=a.notes;$('code-section').hidden=!e.starter;$('code').value=draft(a,e);renderLanguage();text('test-results','');text('revisit',a.revisit?'↺ Saved for later':'↺ Save for later');$('revisit').setAttribute('aria-pressed',String(a.revisit));
 renderHints();renderReview();renderLibrary();renderTheme();
 $('run').disabled=!!activeRun||!runnerReady||!activeLanguage(a).runnable;
}
$('search').addEventListener('input',e=>{query=e.target.value;renderLibrary();});$('queue').addEventListener('click',()=>{queue=!queue;renderLibrary();});
$('pick').addEventListener('click',()=>{const pool=exercises.filter(e=>!state.attempts[e.id]?.done);const candidates=pool.length?pool:exercises;select(candidates[Math.floor(Math.random()*candidates.length)].id);$('workspace').scrollIntoView({behavior:'instant'});});
for(const field of ['notes','reflection'])$(field).addEventListener('input',()=>{attempt()[field]=$(field).value;save();});

$('code').addEventListener('input',()=>{cancelRun();text('test-results','');setDraft(attempt(),$('code').value);save();});
$('language').addEventListener('change',()=>{cancelRun();attempt().language=$('language').value;save();$('code').value=draft(attempt(),current());text('test-results','');renderLanguage();});
$('hint').addEventListener('click',()=>{attempt().hints=Math.min(3,attempt().hints+1);save();renderHints();});
$('review-toggle').addEventListener('click',()=>{attempt().review=!attempt().review;save();renderReview();});
$('complete').addEventListener('click',()=>{const a=attempt();if(!a.done&&!a.reflection.trim()){text('save-state','Write a short reflection before marking this reviewed.');$('reflection').focus();return;}a.done=!a.done;save();renderReview();renderLibrary();});
$('revisit').addEventListener('click',()=>{attempt().revisit=!attempt().revisit;save();text('revisit',attempt().revisit?'↺ Saved for later':'↺ Save for later');$('revisit').setAttribute('aria-pressed',String(attempt().revisit));renderLibrary();});
$('theme').addEventListener('click',()=>{
 state.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';renderTheme();
 let saved,notebook;
 try{saved=localStorage.getItem(key);}catch{$('save-state').textContent=t('Browser storage is unavailable or full. Export a backup.');return;}
 try{notebook=saved===null?blank():JSON.parse(saved);validate(notebook,ids);}catch{$('save-state').textContent=t('Saved data could not be loaded. Export or keep a backup.');return;}
 // Another tab may have newer drafts. Keep its stored fields and change only the theme.
 notebook.theme=state.theme;
 try{localStorage.setItem(key,JSON.stringify(notebook));$('save-state').textContent=t('Saved on this device');}catch{$('save-state').textContent=t('Browser storage is unavailable or full. Export a backup.');}
});
$('reset-code').addEventListener('click',()=>{if(!confirm(t('Replace this exercise’s code with the starter? Your notes stay.')))return;cancelRun();setDraft(attempt(),starter(current(),activeLanguage(attempt()).id));$('code').value=draft(attempt(),current());save();text('test-results','');});
function cancelRun(){if(!activeRun)return;$('runner').contentWindow.postMessage({type:'cancel'},'*');finishRun();}
function finishRun(){clearTimeout(runTimer);activeRun=null;$('run').disabled=!runnerReady||!activeLanguage(attempt()).runnable;}
$('run').addEventListener('click',async()=>{
 const e=current(),language=activeLanguage(attempt());if(!e.tests||!language.runnable||!runnerReady||activeRun)return;
 const id=++runId,code=$('code').value;activeRun={runId:id,exercise:e.id,language:language.id};$('run').disabled=true;
 text('test-results',language.id==='c'||language.id==='cpp'?'Loading the local compiler (about 60 MB on first use)…':language.id==='python'?'Loading Python locally (about 14 MB on first use)…':language.id==='typescript'?'Loading the TypeScript transpiler…':'Running. The rubber duck is watching.');
 runTimer=setTimeout(()=>{const visible=activeRun?.exercise===state.selected;finishRun();if(visible)text('test-results','Runtime did not finish loading. Check your connection and try again.');},45000);
 try{
  const runtime=await resources(language.id);if(activeRun?.runId!==id)return;
  $('runner').contentWindow.postMessage({type:'run',runId:id,code,language:language.id,resources:runtime,tests:e.tests.map(t=>({...t,immutable:e.id==='merge'}))},'*');
 }catch(error){const visible=activeRun?.exercise===state.selected;finishRun();if(visible)text('test-results',String(error.message));}
});
addEventListener('message',event=>{
 if(event.source!==$('runner').contentWindow)return;const data=event.data;
 if(data?.type==='runner-ready'){runnerReady=true;$('run').disabled=!!activeRun||!activeLanguage(attempt()).runnable;return;}
 if(!activeRun||data?.runId!==activeRun.runId)return;if(data.type==='executing'){clearTimeout(runTimer);runTimer=setTimeout(()=>{const visible=activeRun?.exercise===state.selected;finishRun();if(visible)text('test-results','Execution stopped. Try again.');},5000);return;}const visible=activeRun.exercise===state.selected&&activeRun.language===activeLanguage(attempt()).id;finishRun();if(!visible)return;
 if(data.type==='program'){text('test-results',String(data.output).slice(0,16000)+'\n\n'+t('Program finished. This does not mark the exercise as passed.'));return;}
 if(data.type==='error'){text('test-results',String(data.message).slice(0,16000));return;}
 if(data.type!=='result'||!Array.isArray(data.results)){text('test-results','Unexpected runner response.');return;}
 const passed=data.results.filter(r=>r.pass===true).length;const summary=document.createElement('p');summary.className='test-summary';summary.textContent=passed===data.results.length?t('{passed}/{total} checks passed. Now try to break it yourself.',{passed:number(passed),total:number(data.results.length)}):t('{passed}/{total} checks passed. A useful clue, not a verdict.',{passed:number(passed),total:number(data.results.length)});
 $('test-results').replaceChildren(summary,...data.results.slice(0,20).map((r,i)=>{const row=document.createElement('div');row.className=r.pass?'test-pass':'test-fail';row.textContent=`${r.pass?'✓':'×'} ${t('Check {number}: expected {expected} · got {actual}',{number:number(i+1),expected:String(r.expected).slice(0,500),actual:String(r.actual).slice(0,500)})}${r.note?' · '+t(String(r.note).slice(0,200)):''}`;return row;}));
});
for(const [trigger,dialog] of [['backup','backup-dialog'],['about','about-dialog']])$(trigger).addEventListener('click',()=>$(dialog).showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`thinkroom-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('import-file').addEventListener('change',async()=>{pendingImport=null;$('import-confirm').disabled=true;const file=$('import-file').files[0];if(!file)return;if(file.size>16000000){importStatus('This file is too large. Maximum: 16 MB.');return;}try{pendingImport=validate(JSON.parse(await file.text()),ids);importStatus('{count} saved exercises ready to import.',{count:number(Object.keys(pendingImport.attempts).length)});$('import-confirm').disabled=false;}catch(error){importStatus('Could not read backup: {error}',{error:t(error.message)});}});
$('import-confirm').addEventListener('click',()=>{if(!pendingImport)return;cancelRun();state.attempts={...state.attempts,...pendingImport.attempts};pendingImport=null;$('import-confirm').disabled=true;save();render();importStatus('Imported. Your notebook is ready.');});
render();

$('runner').addEventListener('load',()=>$('runner').contentWindow.postMessage({type:'ping'},'*'));
$('runner').contentWindow.postMessage({type:'ping'},'*');
