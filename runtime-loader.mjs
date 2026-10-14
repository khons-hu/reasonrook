const cache={};
async function get(path,binary=false){
 const controller=new AbortController();
 let timer;
 const reset=()=>{
  clearTimeout(timer);
  timer=setTimeout(()=>controller.abort(new DOMException('Runtime download timed out.','TimeoutError')),30000);
 };
 reset();
 try{
  const response=await fetch(path,{credentials:'omit',signal:controller.signal});
  if(!response.ok)throw Error(`Runtime download failed (${response.status}). Try again when online.`);
  if(!response.body)return binary?await response.arrayBuffer():await response.text();
  // Large cold runtimes need time on a slow connection. Abort stalled reads.
  const stream=response.body.pipeThrough(new TransformStream({transform(chunk,output){reset();output.enqueue(chunk);}}));
  const download=new Response(stream);
  return binary?await download.arrayBuffer():await download.text();
 }finally{clearTimeout(timer);}
}
export async function resources(language){
 if(language==='javascript')return {};
 if(language==='c'||language==='cpp'){
  if(!cache.clang)cache.clang=Promise.all(['shared.js','clang','lld','memfs','sysroot.tar'].map(name=>get('./vendor/clang/'+name,name!=='shared.js'))).then(([shared,clang,lld,memfs,sysroot])=>({shared,clang,lld,memfs,'sysroot.tar':sysroot})).catch(e=>{delete cache.clang;throw e;});
  return cache.clang;
 }
 if(!cache[language])cache[language]=(language==='typescript'?get('./vendor/typescript/typescript.js').then(typescript=>({typescript})):Promise.all([get('./vendor/pyodide/loader-classic.js'),get('./vendor/pyodide/module-classic.js'),get('./vendor/pyodide/pyodide.asm.wasm',true),get('./vendor/pyodide/python_stdlib.zip',true),get('./vendor/pyodide/pyodide-lock.json')]).then(([loader,module,wasm,stdlib,lock])=>({loader,module,wasm,stdlib,lock:JSON.parse(lock)}))).catch(e=>{delete cache[language];throw e;});
 return cache[language];
}
