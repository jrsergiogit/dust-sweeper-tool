import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch {
  try { ts = require(path.resolve(path.dirname(process.execPath), '../lib/node_modules/typescript')); }
  catch { throw new Error('Run npm install first (TypeScript is required for these tests).'); }
}
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  module._compile(output, filename);
};
const results = [];
async function test(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: String(error.stack || error) }); console.error(`FAIL ${name}\n${error.stack || error}`); }
}
const load = rel => require(path.join(root, rel));
const math = load('app/lib/recovery-math.ts');
const { chartHeights } = load('app/lib/chart-math.ts');
const { checkInitialQuote } = load('app/lib/preflight.ts');
const { WidgetTracker, failureCategory, hasPartialTransfer } = load('app/lib/widget-tracker.ts');
const schema = load('app/lib/analytics-schema.ts');
const policy = load('app/lib/lifi-config.ts');

await test('All TypeScript/TSX source files transpile without syntax errors', () => {
  let count = 0;
  function scan(dir) { for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (/\.tsx?$/.test(full) && !full.endsWith('.d.ts')) {
      count++;
      const result = ts.transpileModule(fs.readFileSync(full, 'utf8'), { fileName: full, reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
      const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
      assert.equal(errors.length, 0, `${full}: ${errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('; ')}`);
    }
  }}
  scan(path.join(root, 'app')); assert.ok(count >= 40);
});
await test('Commission wallet and fee policy remain unchanged', () => {
  assert.equal(policy.COMMISSION_WALLET, '0x6c7934F3d22bff6a2b8Db0FB63F74E7bAb728c4c');
  assert.equal(policy.RECOVERY_FEE, .05); assert.equal(policy.SWAP_BRIDGE_FEE, .01);
  assert.deepEqual(policy.DENIED_EXCHANGES, ['nordstern']);
});
await test('Exact 6-decimal amount shared by preflight and widget', () => {
  const amount = math.recoveryAmounts({ rawBalance: '1234567', decimals: 6, balance: 1.234567 });
  assert.equal(amount.baseUnits, '1228394'); assert.equal(amount.human, '1.228394');
  assert.equal(math.decimalToUnits(amount.human, 6).toString(), amount.baseUnits);
});
await test('Large, small, scientific and hex balances retain integer precision', () => {
  assert.equal(math.recoveryAmounts({ rawBalance: '0x1', decimals: 18 }).human, '0.000000000000000001');
  assert.equal(math.decimalToUnits('1e-18', 18), 1n);
  assert.equal(math.recoveryAmounts({ rawBalance: '999999999999999999999999999', decimals: 18 }).baseUnits, (999999999999999999999999999n * 995n / 1000n).toString());
  assert.equal(math.recoveryAmounts({ balance: 'bad', decimals: 18 }).baseUnits, '0');
});
await test('No hidden USD floor; buffered amounts never exceed available units', () => {
  for (let i = 1n; i < 1000n; i += 7n) {
    const amount = BigInt(math.recoveryAmounts({ rawBalance: i.toString(), decimals: 18 }).baseUnits);
    assert.ok(amount > 0n && amount <= i);
  }
});
await test('Analytics buckets contain ranges, not exact wallet holdings', () => {
  const b = math.scanBuckets([{ priceUsd: 1, valueUsd: .4 }, { priceUsd: 0, valueUsd: 0 }]);
  assert.deepEqual(b, { asset_bucket: '2_to_3', value_bucket: 'lt_1', dust_value_bucket: 'lt_1' });
});
await test('Zero recoveries produce zero chart height', () => {
  assert.equal(chartHeights(10, 0, 20).recoveries, 0);
  assert.equal(chartHeights(0, 0, 20).sessions, 0);
  assert.ok(chartHeights(10, 1, 20).recoveries > 0);
});

const route = { id: 'route-001', fromChainId: 56, toChainId: 56, fromAmount: '1000000', toAmountUSD: '1.25',
  fromToken: { address: '0x'+'1'.repeat(40), symbol: 'ABC' }, toToken: { address: policy.NATIVE_ADDRESS, symbol: 'BNB' },
  steps: [{ id: 'step-1', tool: 'sushiswap', execution: { process: [] } }] };
function trackerFixture() {
  const emitted = [], states = [];
  const tracker = new WidgetTracker({ id: () => `op-${emitted.length}-random`, emit: (event, properties) => emitted.push({ event, properties }), update: (feature, state) => states.push({ feature, ...state }) });
  return { tracker, emitted, states };
}
await test('A displayed route is distinct from an execution or completion', () => {
  const f = trackerFixture(); f.tracker.handle('availableRoutes', [route], 'finder');
  assert.deepEqual(f.emitted.map(e=>e.event), ['recovery_route_available']);
});
await test('Changed source token and absent external selection do not discard completion', () => {
  const f = trackerFixture(); const changed = { ...route, fromToken: { address: '0x'+'2'.repeat(40), symbol: 'OTHER' } };
  f.tracker.handle('routeExecutionStarted', changed, 'finder'); f.tracker.handle('routeExecutionCompleted', changed, 'finder');
  assert.equal(f.emitted.filter(e=>e.event==='recovery_completed').length, 1);
});
await test('Route ownership survives tab changes and duplicate completion events', () => {
  const f = trackerFixture();
  f.tracker.handle('routeExecutionStarted', route, 'finder');
  f.tracker.handle('routeExecutionCompleted', route, 'bridge');
  f.tracker.handle('routeExecutionCompleted', route, 'bridge');
  assert.equal(f.emitted.filter(e=>e.event==='recovery_completed').length, 1);
  assert.equal(f.emitted.filter(e=>e.event==='bridge_completed').length, 0);
});
await test('Completion without observed start is recorded and explicitly marked', () => {
  const f = trackerFixture(); f.tracker.handle('routeExecutionCompleted', route, 'swap');
  const e=f.emitted.find(e=>e.event==='swap_completed'); assert.ok(e); assert.equal(e.properties.start_observed,false);
});
await test('Route refresh cannot unlock controls during an active transaction', () => {
  const f=trackerFixture(); f.tracker.handle('routeExecutionStarted',route,'finder');
  f.tracker.handle('availableRoutes',[route],'finder'); f.tracker.handle('routeSelected',{route},'finder');
  assert.equal(f.states.at(-1).busy,true);
});
await test('User cancellation, insufficient gas and reverts are distinct', () => {
  assert.equal(failureCategory({route, error:{code:4001,message:'User denied'}}),'user_cancelled');
  assert.equal(failureCategory({route, error:{message:'Insufficient funds for gas'}}),'insufficient_gas');
  assert.equal(failureCategory({route, error:{message:'execution reverted'}}),'transaction_reverted');
});
await test('Partial cross-chain completion warns and does not auto-restart', () => {
  const partial=structuredClone(route); partial.steps[0].execution.process=[{type:'CROSS_CHAIN',status:'DONE',txHash:'0x123'}];
  assert.equal(hasPartialTransfer(partial),true);
  const f=trackerFixture(); f.tracker.handle('routeExecutionFailed',{route:partial,error:{message:'RPC timeout'}},'finder');
  assert.equal(f.states.at(-1).partial,true); assert.match(f.states.at(-1).message,/do not restart/);
  assert.equal(f.emitted.filter(e=>e.event==='recovery_execution_started').length,0);
});
await test('Approvals and transfer submission are measured separately from recovery', () => {
  const updated=structuredClone(route); updated.steps[0].execution.process=[{type:'TOKEN_ALLOWANCE',status:'DONE',txHash:'0xabc'},{type:'SWAP',status:'PENDING',txHash:'0xdef'}];
  const f=trackerFixture(); f.tracker.handle('routeExecutionUpdated',{route:updated},'finder');
  assert.ok(f.emitted.some(e=>e.event==='token_approval_confirmed'));
  assert.ok(f.emitted.some(e=>e.event==='transaction_submitted'&&e.properties.stage==='transfer'));
  assert.equal(f.emitted.filter(e=>e.event==='recovery_completed').length,0);
});

const quote={tool:'sushiswap',estimate:{fromAmount:'100',toAmount:'200',approvalAddress:'0x'+'3'.repeat(40)},transactionRequest:{to:'0x'+'4'.repeat(40),data:'0x1234',value:'0x0',chainId:56}};
const input={chainId:'56',fromToken:'0x'+'1'.repeat(40),fromAddress:'0x'+'2'.repeat(40),fromAmount:'100'};
const quoteFetch=async()=>Response.json({quote});
await test('Incomplete transaction data is never labelled ready', async()=>{
  const q={...quote,transactionRequest:undefined}; const state=await checkInitialQuote(input,new AbortController().signal,undefined,async()=>Response.json({quote:q}));
  assert.equal(state.status,'incomplete'); assert.equal(state.category,'missing_transaction');
});
await test('No provider does not imply that token approval is required', async()=>{
  const state=await checkInitialQuote(input,new AbortController().signal,undefined,quoteFetch); assert.equal(state.status,'unchecked');
});
await test('Wrong-network provider receives no eth_call or gas estimate', async()=>{
  const calls=[];const provider={request:async({method})=>{calls.push(method);return '0x1';}};
  const state=await checkInitialQuote(input,new AbortController().signal,provider,quoteFetch);
  assert.equal(state.status,'wrong-network');assert.deepEqual(calls,['eth_chainId']);
});
await test('Preflight never asks for connection, approval or signatures', async()=>{
  const calls=[];const provider={request:async({method})=>{calls.push(method);if(method==='eth_chainId')return '0x38';if(method==='eth_accounts')return [input.fromAddress];if(method==='eth_call')return '0x0';throw new Error(method);}};
  const state=await checkInitialQuote(input,new AbortController().signal,provider,quoteFetch);
  assert.equal(state.status,'needs-approval'); assert.deepEqual(calls,['eth_chainId','eth_accounts','eth_call']);
});
await test('The network is rechecked before gas simulation', async()=>{
  let chains=0;const calls=[];const provider={request:async({method})=>{calls.push(method);if(method==='eth_chainId')return ++chains===1?'0x38':'0x1';if(method==='eth_accounts')return [input.fromAddress];if(method==='eth_call')return '0xffff';throw new Error('must not estimate');}};
  const state=await checkInitialQuote(input,new AbortController().signal,provider,quoteFetch);
  assert.equal(state.status,'unchecked');assert.ok(!calls.includes('eth_estimateGas'));
});
await test('Obsolete asynchronous quote is discarded after cancellation', async()=>{
  const c=new AbortController();let release;const late=new Promise(r=>{release=r;});
  const pending=checkInitialQuote(input,c.signal,undefined,()=>late);c.abort();release(Response.json({quote}));
  await assert.rejects(pending,e=>e.name==='AbortError');
});
await test('Native coin does not request a same-token same-chain quote',async()=>{
  let called=false;const state=await checkInitialQuote({...input,fromToken:policy.NATIVE_ADDRESS},new AbortController().signal,undefined,async()=>{called=true;return Response.json({});});
  assert.equal(called,false);assert.equal(state.status,'idle');
});
await test('Sensitive arbitrary analytics fields are rejected and formulas escaped',()=>{
  const cleaned=schema.cleanAnalyticsProperties({wallet_address:input.fromAddress,private_key:'secret',exact_balance:123,feature:'finder',error_category:'=IMPORTXML("x")',route_tool:input.fromToken});
  assert.equal(cleaned.wallet_address,undefined);assert.equal(cleaned.exact_balance,undefined);
  assert.ok(cleaned.error_category.startsWith("'="));assert.equal(cleaned.route_tool,'[redacted]');
});

// Mock framework boundaries for route-handler and structural component tests only.
const originalLoad=Module._load;
let reactMock={useEffect:()=>{},useMemo:f=>f(),useRef:x=>({current:x}),useState:x=>[typeof x==='function'?x():x,()=>{}]};
const jsx=(type,props)=>({type,props:props||{}});
Module._load=function(name,parent,isMain){
  if(name==='next/server')return {NextResponse:{json:(data,init)=>Response.json(data,init)},NextRequest:Request};
  if(name==='react')return reactMock;
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='next/dynamic')return ()=> 'TEST_LIFI_WIDGET';
  if(name==='next/navigation')return {usePathname:()=>globalThis.window?.location?.pathname||'/'};
  if(name==='@lifi/widget')return {WidgetEvent:{},useWidgetEvents:()=>({on:()=>{},off:()=>{}})};
  return originalLoad.apply(this,arguments);
};
const originalFetch=globalThis.fetch;
const quoteRoute=load('app/api/lifi/quote/route.ts');
const makeRequest=(body)=>new Request('https://dustsweepertool.com/api/lifi/quote',{method:'POST',headers:{origin:'https://dustsweepertool.com','content-type':'application/json'},body:JSON.stringify(body)});
await test('Quote API keeps the key server-side and fixes fee/destination policy',async()=>{
  process.env.LIFI_SWEEPER_API_KEY='test-private-key-not-a-real-credential';let call;
  globalThis.fetch=async(url,options)=>{call={url,options};return Response.json(quote);};
  const response=await quoteRoute.POST(makeRequest({...input,fee:'0',referrer:input.fromAddress,url:'http://internal.local'}));
  assert.equal(response.status,200);const body=await response.json();
  assert.equal(call.options.headers['x-lifi-api-key'],'test-private-key-not-a-real-credential');
  const url=new URL(call.url);assert.equal(url.origin,'https://li.quest');assert.equal(url.searchParams.get('fee'),'0.05');assert.equal(url.searchParams.get('referrer'),policy.COMMISSION_WALLET);assert.equal(url.searchParams.get('denyExchanges'),'nordstern');assert.equal(url.searchParams.get('order'),null);
  assert.ok(!JSON.stringify(body).includes('test-private-key'));
  delete process.env.LIFI_SWEEPER_API_KEY;globalThis.fetch=originalFetch;
});
await test('Quote API rejects invalid chains, zero amounts, native self-swaps and foreign origin',async()=>{
  assert.equal((await quoteRoute.POST(makeRequest({...input,chainId:'99999'}))).status,400);
  assert.equal((await quoteRoute.POST(makeRequest({...input,fromAmount:'0'}))).status,400);
  assert.equal((await quoteRoute.POST(makeRequest({...input,fromToken:policy.NATIVE_ADDRESS}))).status,400);
  const foreign=new Request('https://dustsweepertool.com/api/lifi/quote',{method:'POST',headers:{origin:'https://other.invalid'},body:'{}'});
  assert.equal((await quoteRoute.POST(foreign)).status,403);
});
await test('Alchemy partial-network failures preserve successful assets',async()=>{
  process.env.ALCHEMY_API_KEY='fake-test-key';globalThis.fetch=async()=>Response.json({data:{tokens:[{network:'bnb-mainnet',tokenBalance:'0x64',tokenAddress:input.fromToken,tokenMetadata:{decimals:2,symbol:'TEST'},tokenPrices:[]}]},error:{partialErrors:[{network:'eth-mainnet',message:'timeout'}]}});
  const handler=load('app/api/alchemy/tokens/route.ts');const response=await handler.POST(makeRequest({address:input.fromAddress}));const data=await response.json();
  assert.equal(response.status,200);assert.equal(data.tokens.length,1);assert.equal(data.tokens[0].rawBalance,'0x64');assert.equal(data.partial,true);assert.deepEqual(data.failedNetworks,['eth-mainnet']);
  delete process.env.ALCHEMY_API_KEY;globalThis.fetch=originalFetch;
});

let sent=[];
function browser(url,referrer='') {
  const memory=new Map();
  globalThis.window={location:new URL(url),sessionStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},history:{state:{next:'keep'},replaceState(state,_title,url){assert.deepEqual(state,{next:'keep'});window.location=new URL(url,window.location.origin);}},matchMedia:()=>({matches:false}),setTimeout:f=>{f();return 0;},clearTimeout:()=>{}};
  globalThis.document={referrer};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{language:'en-US',userAgent:'test desktop',sendBeacon:(_url,blob)=>{sent.push(blob);return true;}}});
  delete require.cache[require.resolve(path.join(root,'app/lib/dust-analytics.ts'))];
  return load('app/lib/dust-analytics.ts');
}
await test('Campaign and gclid are captured before CleanUrl; tool and Google linker remain',()=>{
  const analytics=browser('https://dustsweepertool.com/?utm_source=google&utm_medium=cpc&utm_campaign=test-launch&gclid=click-123&_gl=linker&tool=bridge');
  reactMock.useEffect=f=>f();const Clean=load('app/CleanUrl.tsx').default;Clean();reactMock.useEffect=()=>{};
  const a=analytics.captureAttribution();assert.equal(a.campaign,'test-launch');assert.equal(a.gclid,'click-123');
  assert.equal(window.location.searchParams.has('utm_source'),false);assert.equal(window.location.searchParams.get('gclid'),'click-123');assert.equal(window.location.searchParams.get('_gl'),'linker');assert.equal(window.location.searchParams.get('tool'),'bridge');
});
await test('Self-referrals are not classified as an external traffic source',()=>{
  const a=browser('https://dustsweepertool.com/','https://dustsweepertool.com/learn/guide').captureAttribution();assert.equal(a.source,'direct');assert.equal(a.referrer,'');
});
await test('Advertising identifiers stay out of the custom analytics payload',async()=>{
  sent=[];const analytics=browser('https://dustsweepertool.com/?gclid=private-click-id');analytics.trackDustEvent('page_view',{language:'en'});
  const payload=JSON.parse(await sent[0].text());assert.ok(!JSON.stringify(payload).includes('private-click-id'));assert.equal(payload.source,'google');assert.equal(payload.properties.has_ad_click,true);
  assert.equal(payload.schema_version,3);assert.equal(payload.properties.analytics_version,'v3');
  assert.ok(Number.isFinite(Date.parse(payload.occurred_at)));assert.ok(payload.event_id);
});

// Structural UI assertions execute the real component with mock React hooks (not a browser or visual test).
const portalSource=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const hookNames=[...portalSource.matchAll(/const \[([A-Za-z0-9_]+),[^\n]*?= useState(?:<[^\n]*>)?\(/g)].map(m=>m[1]);
let hookIndex=0,override={},setValues={};
reactMock={useEffect:()=>{},useMemo:f=>f(),useRef:x=>({current:x}),useState(init){const key=hookNames[hookIndex++];return [Object.prototype.hasOwnProperty.call(override,key)?override[key]:typeof init==='function'?init():init,v=>{setValues[key]=v;}];}};
const Portal=load('app/page.tsx').default;
function render(values={}){hookIndex=0;override=values;setValues={};return Portal();}
function nodes(root){if(root===null||root===undefined||typeof root==='boolean')return[];if(Array.isArray(root))return root.flatMap(nodes);if(typeof root!=='object')return[root];return[root,...nodes(root.props?.children)];}
const asset={chainId:56,tokenAddress:input.fromToken,symbol:'TEST',name:'Test',rawBalance:'1234567',balance:1.234567,decimals:6,priceUsd:1,valueUsd:1.23};
await test('Initial UX contains no fake recoverable $0 and no LI.FI widget',()=>{
  const tree=nodes(render());assert.equal(tree.filter(n=>n?.type==='TEST_LIFI_WIDGET').length,0);assert.ok(!JSON.stringify(tree).includes('Total recoverable'));const intro=tree.find(n=>typeof n?.type==='function'&&n.type.name==='FinderIntro');assert.ok(intro);const rendered=nodes(intro.type(intro.props));assert.ok(JSON.stringify(rendered).includes('No wallet connection'));
});
await test('Scan results without a selected asset do not render a recovery widget',()=>{
  const tree=nodes(render({scanStep:'result',foundTokens:[asset],foundBalance:'1.23',finderAddress:input.fromAddress}));assert.equal(tree.filter(n=>n?.type==='TEST_LIFI_WIDGET').length,0);assert.ok(JSON.stringify(tree).includes('Check options'));
});
await test('Selected asset mounts one widget with the exact amount and unchanged fee',()=>{
  const widgets=nodes(render({scanStep:'result',foundTokens:[asset],selectedRecoveryToken:asset,finderAddress:input.fromAddress})).filter(n=>n?.type==='TEST_LIFI_WIDGET');
  assert.equal(widgets.length,1);assert.equal(widgets[0].props.config.fromAmount,'1.228394');assert.equal(widgets[0].props.config.fee,.05);assert.equal(widgets[0].props.config.referrer,policy.COMMISSION_WALLET);
});
await test('Native selection requires choosing a destination instead of self-swapping',()=>{
  const native={...asset,tokenAddress:null,symbol:'BNB'};
  const widget=nodes(render({scanStep:'result',foundTokens:[native],selectedRecoveryToken:native,finderAddress:input.fromAddress})).find(n=>n?.type==='TEST_LIFI_WIDGET');
  assert.equal(widget.props.config.fromToken,policy.NATIVE_ADDRESS);assert.equal(widget.props.config.toToken,'');
});
await test('Returning to Finder does not reset the scan results',()=>{
  const tree=nodes(render({activeTab:'swap',scanStep:'result',foundTokens:[asset]}));
  const button=tree.find(n=>n?.type==='button'&&JSON.stringify(n.props.children).includes('Dust Finder'));
  assert.ok(button);button.props.onClick();assert.equal(setValues.activeTab,'finder');assert.equal(setValues.scanStep,undefined);
});
await test('Sharing appears after completion, not immediately after the scan',()=>{
  const first=JSON.stringify(nodes(render({scanStep:'result',foundTokens:[asset],selectedRecoveryToken:asset,finderAddress:input.fromAddress})));
  assert.ok(!first.includes('Share recovery'));
  const states={finder:{status:'completed',message:'Complete',busy:false},swap:{status:'idle',busy:false},bridge:{status:'idle',busy:false},safety:{status:'idle',busy:false}};
  const complete=JSON.stringify(nodes(render({scanStep:'result',foundTokens:[asset],selectedRecoveryToken:asset,finderAddress:input.fromAddress,widgetStates:states})));
  assert.ok(complete.includes('Share recovery'));
});


const ux=load('app/lib/finder-ux.ts');
await test('Price filters really filter without hiding unpriced assets by default',()=>{
  const unpriced={...asset,symbol:'UNPRICED',name:'Unknown',priceUsd:0,valueUsd:0};
  const net=x=>String(x.chainId),label=x=>({symbol:x.symbol,name:x.name});
  assert.equal(ux.visibleAssets([asset,unpriced],{price:'all',search:'',network:'all'},net,label).length,2);
  assert.deepEqual(ux.visibleAssets([asset,unpriced],{price:'unpriced',search:'',network:'all'},net,label),[unpriced]);
  assert.deepEqual(ux.visibleAssets([asset,unpriced],{price:'priced',search:'',network:'all'},net,label),[asset]);
});
await test('Token search, network filter and sort preserve stable object identity',()=>{
  const second={...asset,symbol:'ABC',name:'Alpha',chainId:1,valueUsd:100};
  const net=x=>String(x.chainId),label=x=>({symbol:x.symbol,name:x.name});
  const all=ux.visibleAssets([asset,second],{price:'all',search:'',network:'all'},net,label);
  assert.equal(all[0],second);
  assert.deepEqual(ux.visibleAssets([asset,second],{price:'all',search:'alpha',network:'1'},net,label),[second]);
});
await test('Positive dust quantities do not display as zero',()=>{
  assert.equal(ux.displayAssetAmount(1e-18),'<0.000001');assert.equal(ux.displayAssetAmount(1.25),'1.25');
});
await test('Selecting an asset hides the results list but preserves the selected widget',()=>{
  const tree=nodes(render({scanStep:'result',foundTokens:[asset],selectedRecoveryToken:asset,finderAddress:input.fromAddress}));
  assert.equal(tree.filter(n=>n?.props?.['aria-label']==='Search assets').length,0);
  assert.equal(tree.filter(n=>n?.type==='TEST_LIFI_WIDGET').length,1);
});
await test('The existing LI.FI environment key is read only in the server fallback',async()=>{
  process.env.NEXT_PUBLIC_LIFI_SWEEPER_KEY='fake-legacy-key';let header;
  globalThis.fetch=async(_url,opts)=>{header=opts.headers['x-lifi-api-key'];return Response.json(quote);};
  const response=await quoteRoute.POST(makeRequest(input));assert.equal(header,'fake-legacy-key');
  assert.ok(!JSON.stringify(await response.json()).includes('fake-legacy-key'));
  delete process.env.NEXT_PUBLIC_LIFI_SWEEPER_KEY;globalThis.fetch=originalFetch;
});
await test('Local previews do not send analytics or ad conversion events',()=>{
  const before=sent.length;const analytics=browser('http://localhost:3000/');analytics.trackDustEvent('wallet_scan_started');assert.equal(sent.length,before);
});
await test('Sheets transport preserves existing fields and forwards v3 event identity and time',async()=>{
  process.env.ANALYTICS_SHEETS_WEB_APP_URL='https://example.invalid/script';process.env.ANALYTICS_SHARED_SECRET='fake-secret';
  let payload;globalThis.fetch=async(_url,opts)=>{payload=JSON.parse(opts.body);return Response.json({ok:true});};
  const handler=load('app/api/analytics-event/route.ts');
  const response=await handler.POST(makeRequest({event:'recovery_completed',event_id:'event-123456',session_id:'session-123456',source:'direct',properties:{feature:'finder',route_status:'completed'}}));
  assert.equal(response.status,200);assert.equal(payload.action,'event');
  assert.deepEqual(Object.keys(payload.data).sort(),['event','event_id','occurred_at','session_id','device','path','source','medium','campaign','content','term','referrer','properties'].sort());
  assert.equal(payload.data.event_id,'event-123456');assert.equal(payload.data.occurred_at,'');
  delete process.env.ANALYTICS_SHEETS_WEB_APP_URL;delete process.env.ANALYTICS_SHARED_SECRET;globalThis.fetch=originalFetch;
});
const { runAnalyticsV3Tests } = await import('./test-analytics-v3.mjs');
await runAnalyticsV3Tests({ test, load, root, react: reactMock });
Module._load=originalLoad;globalThis.fetch=originalFetch;
const report={createdAt:new Date().toISOString(),node:process.version,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,
  scope:'Local regression tests, mocked framework/provider boundaries, structural JSX checks and source transpilation. Not a production build, visual browser test or real transaction.',results};
fs.mkdirSync(path.join(root,'tests'),{recursive:true});fs.writeFileSync(path.join(root,'tests','last-run.json'),JSON.stringify(report,null,2)+'\n');
console.log(`\n${report.passed} passed; ${report.failed} failed. Not an end-to-end production test.`);
if(report.failed)process.exitCode=1;
