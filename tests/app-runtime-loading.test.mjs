import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.mjs',import.meta.url),'utf8');
function fixture(){
 const timers=new Map(),messages=[],nodes={run:{addEventListener(_event,callback){this.click=callback;}},code:{value:'fixture'},runner:{contentWindow:{postMessage(value){messages.push(value);}}}};
 let resolve,reject;const download=new Promise((yes,no)=>{resolve=yes;reject=no;});
 const context=vm.createContext({activeRun:null,runId:0,runTimer:null,runnerReady:true,state:{selected:'fixture'},current:()=>({id:'fixture',tests:[]}),activeLanguage:()=>({id:'c',runnable:true}),attempt:()=>({}),$:id=>nodes[id],text(){},resources:()=>download,setTimeout(fn,ms){const id=timers.size+1;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)});
 context.finishRun=()=>{context.clearTimeout(context.runTimer);context.activeRun=null;};
 vm.runInContext(source.slice(source.indexOf("$('run').addEventListener('click'"),source.indexOf("addEventListener('message',event=>")),context);
 return {context,nodes,timers,messages,resolve,reject};
}
test('worker startup timeout begins after a cold runtime finishes downloading',async()=>{
 const f=fixture(),run=f.nodes.run.click();
 assert.equal(f.timers.size,0,'the 45-second worker timer must not cover the network download');
 f.resolve({fixture:true});await run;
 assert.equal([...f.timers.values()][0].ms,45000);assert.equal(f.messages[0].type,'run');
});
test('a canceled download failure does not clear a newer run',async()=>{
 const f=fixture(),run=f.nodes.run.click();f.context.activeRun={runId:2,exercise:'fixture',language:'c'};
 f.reject(new Error('stalled'));await run;
 assert.equal(f.context.activeRun.runId,2);
});
