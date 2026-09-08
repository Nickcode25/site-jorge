import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const output = 'outputs/mobile-qa';
await mkdir(output, { recursive: true });
const fixture = {
  id: 'test-property', codigo: '1024', titulo: 'Apartamento amplo com varanda e vista para a cidade',
  tipo: 'apartamento', preco: 1250000, cep: '36570000', endereco: 'Rua das Flores', numero: '120',
  bairro: 'Centro', cidade: 'Viçosa', estado: 'MG', descricao: 'Imóvel de teste para verificar o layout.',
  quartos: 3, banheiros: 2, vagas: 2, area: 120, destaque: true, status: 'disponivel',
  criado_em: '2026-09-01T12:00:00Z', atualizado_em: '2026-09-01T12:00:00Z',
  imagens: ['/brand/properties-hero-jls.png', '/brand/hero-jls-v2.png'], videos: [], especificacoes: {},
};
const results = [];
const cors = {'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS'};
for (const [engineName, engine] of Object.entries({ chromium, webkit })) {
 const browser = await engine.launch({ headless: true });
 try {
 for (const [width, height] of [[320,568],[375,667],[390,844],[412,915],[768,1024],[844,390],[1024,768],[1440,900]]) {
  const context = await browser.newContext({ viewport: {width,height}, isMobile: width < 1024, hasTouch: true, deviceScaleFactor: 1 });
  await context.route('**/*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'OPTIONS') return route.fulfill({status:204,headers:cors});
    if (url.pathname.startsWith('/rest/v1/imoveis')) return route.fulfill({headers:cors,json:[fixture]});
    if (url.pathname.startsWith('/rest/v1/caracteristicas')) return route.fulfill({headers:cors,json:[]});
    return route.fulfill({status:400,headers:cors,json:{message:'Blocked by local UI test'}});
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function layout(label) {
    const dimensions = await page.evaluate(() => ({width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth}));
    const overflow = dimensions.scroll > dimensions.width + 1;
    if (overflow) {
      const offenders = await page.locator('body *').evaluateAll(els => els.filter(el => {const r=el.getBoundingClientRect();return r.width && r.right>innerWidth+1 && getComputedStyle(el).position!=='fixed';}).slice(0,12).map(el=>({tag:el.tagName,class:el.className,right:el.getBoundingClientRect().right})));
      console.log(JSON.stringify({engineName,width,label,dimensions,offenders}));
    }
    results.push({engine:engineName,width,height,label,overflow,errors:[...errors]});
    await page.screenshot({path:`${output}/${engineName}-${width}-${label.replaceAll('/','_')}.png`,fullPage:false,animations:'disabled'});
  }
  for (const [route, ready] of [['/','.hero'],['/imoveis','.property-card'],['/imoveis/test-property','.gallery-mosaic'],['/admin/login','.login-box'],['/missing-page','.not-found']]) {
    await page.goto(baseURL+route);
    await page.locator(ready).first().waitFor();
    await layout(route);
    if (route === '/' && width <= 760) {
      await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
      await page.getByRole('navigation',{name:'Navegação principal'}).getByText('Imóveis',{exact:true}).click();
      await page.locator('.property-card').first().waitFor();
    }
    if (route === '/imoveis/test-property') {
      await page.locator('.gallery-mosaic-tile--main').click();
      await page.getByRole('dialog').waitFor();
      await layout('gallery');
      await page.getByRole('button',{name:'Próxima mídia',exact:true}).click();
      assert.match(await page.locator('.gallery-modal-counter').innerText(),/2 \/ 2/);
      await page.getByRole('button',{name:'Fechar galeria (Esc)',exact:true}).click();
    }
  }
  // Simulated authentication stays in this isolated browser; no production writes.
  await context.addInitScript(() => {
    const user={id:'00000000-0000-4000-8000-000000000001',email:'mobile-test@example.test',role:'authenticated',aud:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
    localStorage.setItem('sb-olafxnertfzbpocwends-auth-token',JSON.stringify({access_token:'test-token',refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));
  });
  await context.route('**/auth/v1/user',route=>route.fulfill({headers:cors,json:{id:'00000000-0000-4000-8000-000000000001',email:'mobile-test@example.test',role:'authenticated',aud:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'}}));
  for (const [route,ready] of [['/admin','.admin-overview-content'],['/admin/imoveis','.admin-property-row']]) {
    await page.goto(baseURL+route);
    await page.locator(ready).first().waitFor();
    await layout(route);
  }
  await page.getByRole('button',{name:'Novo imóvel',exact:true}).first().click();
  await page.locator('.property-modal').waitFor();
  await layout('admin-editor');
  const modalSize=await page.locator('.property-modal').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
  assert.ok(modalSize.scroll <= modalSize.client+1,`editor overflow ${engineName} ${width}`);
  await page.locator('.property-modal input').first().fill('Teste de layout');
  await context.close();
 }
 } finally { await browser.close(); }
}
await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
const failures=results.filter(r=>r.overflow || r.errors.length);
console.log(JSON.stringify({checks:results.length,failures},null,2));
assert.equal(failures.length,0,'Mobile layout or runtime errors detected');
