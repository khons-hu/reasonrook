import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

async function downloadHarness() {
 const source=await readFile(new URL('../runtime-loader.mjs',import.meta.url),'utf8');
 let now=0,nextId=0,stream;
 const timers=new Map();
 const schedule=(fn,delay)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;};
 const abortAfter=delay=>{const controller=new AbortController();schedule(()=>controller.abort(new DOMException('Stalled download','TimeoutError')),delay);return controller.signal;};
 const context=vm.createContext({
  Response,ReadableStream,TransformStream,AbortController,DOMException,
  AbortSignal:{timeout:abortAfter},setTimeout:schedule,clearTimeout:id=>timers.delete(id),
  fetch:async(_url,{signal})=>new Response(new ReadableStream({start(controller){stream=controller;signal.addEventListener('abort',()=>controller.error(signal.reason),{once:true});}}))
 });
 vm.runInContext(source.replace(/^export /gm,'')+'\nglobalThis.resources=resources;',context);
 const pending=context.resources('typescript');
 pending.catch(()=>{});
 await new Promise(setImmediate);
 return {pending,
  chunk:text=>stream.enqueue(new TextEncoder().encode(text)),
  close:()=>stream.close(),
  async advance(ms){now+=ms;for(const [id,timer] of timers){if(timer.at<=now){timers.delete(id);timer.fn();}}await new Promise(setImmediate);}
 };
}

test('a progressing cold runtime download can take longer than thirty seconds',async()=>{
 const h=await downloadHarness();
 h.chunk('const ');await h.advance(20000);
 h.chunk('answer=');await h.advance(20000);
 h.chunk('42;');h.close();
 assert.equal((await h.pending).typescript,'const answer=42;');
});

test('a runtime download that stops making progress still times out',async()=>{
 const h=await downloadHarness();h.chunk('const ');
 await h.advance(30001);
 await assert.rejects(h.pending,{name:'TimeoutError'});
});
