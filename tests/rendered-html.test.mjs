import assert from 'node:assert/strict';
import test from 'node:test';
import { default as worker } from '../dist/server/index.js';

for (const path of ['/', '/imoveis', '/imoveis/test-property', '/admin/login', '/admin', '/admin/imoveis']) {
  test(`serves the application shell and mobile viewport for ${path}`, async () => {
    const response = await worker.fetch(new Request(`http://localhost${path}`, {headers:{accept:'text/html'}}), {
      ASSETS:{fetch:async()=>new Response('Not found',{status:404})},
    }, {waitUntil(){},passThroughOnException(){}});
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-type') ?? '',/text\/html/);
    const html = await response.text();
    assert.match(html,/JLS Negócios Imobiliários/);
    assert.match(html,/width=device-width/);
    assert.doesNotMatch(html,/maximum-scale=1|user-scalable=no/);
    assert.doesNotMatch(html,/Your site is taking shape|Building your site/);
  });
}
