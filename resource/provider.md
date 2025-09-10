# Implémentation OpenRouter, LiteLLM et E2B Desktop dans notre app

Objectif: fournir aux devs un guide concis et opérationnel pour intégrer OpenRouter, LiteLLM Proxy et E2B Desktop Sandbox, avec outils (tool calling), streaming SSE et sécurité.

---

## 1) Pré-requis et en-têtes

* API base

  * OpenRouter: `https://openrouter.ai/api/v1` (compat. OpenAI) ([OpenRouter][1])
  * LiteLLM Proxy: endpoint OpenAI-compatible exposé localement par votre passerelle. ([docs.litellm.ai][2])
* Auth

  * `Authorization: Bearer <OPENROUTER_API_KEY>` pour OpenRouter. ([OpenRouter][3])
* Attribution facultative côté **serveur** ou **navigateur** si nécessaire:

  * `HTTP-Referer: <APP_URL>`
  * `X-Title: <APP_NAME>` ([OpenRouter][4])
* Outils (tools / function calling): schéma OpenAI-compatible standardisé par OpenRouter. ([OpenRouter][5])

---

## 2) OpenRouter — appels de base

### 2.1 curl

```bash
# Liste des modèles
curl -s https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Chat completions (non-stream)
curl -s https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/auto",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

Format conforme à l’API OpenRouter. ([OpenRouter][6])

### 2.2 TypeScript (server-side)

```ts
// app/api/chat/route.ts (Next.js, runtime Node)
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'openrouter/auto', stream = true } = await req.json();

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      'Content-Type': 'application/json',
      ...(process.env.APP_URL ? { 'HTTP-Referer': process.env.APP_URL } : {}),
      ...(process.env.APP_NAME ? { 'X-Title': process.env.APP_NAME } : {}),
      ...(stream ? { 'Accept': 'text/event-stream' } : {})
    },
    body: JSON.stringify({ model, messages, stream })
  });

  if (!stream) return new Response(await r.text(), { status: r.status });

  return new Response(r.body, { headers: { 'Content-Type': 'text/event-stream' } });
}
```

OpenRouter est OpenAI-compatible et supporte le streaming SSE. ([OpenRouter][1])

---

## 3) Tool calling (fonctions) avec OpenRouter

### 3.1 Schéma d’outils

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "open_url_in_sandbox",
        "description": "Open a URL in the active E2B desktop sandbox.",
        "parameters": {
          "type": "object",
          "properties": {
            "url": { "type": "string" }
          },
          "required": ["url"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

OpenRouter standardise l’interface de tool calling sur le format OpenAI. Vérifiez par modèle le support du paramètre `tools`. ([OpenRouter][5])

### 3.2 Boucle d’exécution côté serveur

```ts
type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

async function callOpenRouter(messages: any[], tools: any[]) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openrouter/auto', messages, tools, tool_choice: 'auto'
    })
  });
  const json = await res.json();
  return json;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const tools = [/* cf. schéma ci-dessus */];

  // 1) Appel modèle
  const first = await callOpenRouter(messages, tools);

  // 2) Si tool_calls, exécuter côté serveur puis renvoyer le résultat au modèle
  const calls = first.choices?.[0]?.message?.tool_calls as ToolCall[] | undefined;

  if (calls?.length) {
    const toolOutputs = await Promise.all(calls.map(async (c) => {
      const args = JSON.parse(c.function.arguments || '{}');
      switch (c.function.name) {
        case 'open_url_in_sandbox':
          // à relier à E2B (section 5)
          const result = await openUrlInE2B(args.url);
          return { tool_call_id: c.id, role: 'tool', content: JSON.stringify(result) };
        default:
          return { tool_call_id: c.id, role: 'tool', content: JSON.stringify({ error: 'Unknown tool' }) };
      }
    }));

    // 3) Re-appel LLM avec outputs des tools
    const second = await callOpenRouter(
      [
        ...messages,
        first.choices[0].message,
        ...toolOutputs
      ],
      tools
    );
    return Response.json(second);
  }

  return Response.json(first);
}
```

Mécanique: le LLM **propose** un outil. Le serveur exécute l’outil, renvoie la sortie via un message `role: "tool"` adossé à `tool_call_id`, puis relance le modèle pour formater la réponse finale. ([OpenRouter][5])

---

## 4) Gestion d’erreurs et sécurité OpenRouter

* 401 `User not found` → clé absente/mal transmise: vérifier en headers serveur, jamais côté client. ([OpenRouter][1])
* Utiliser `HTTP-Referer`/`X-Title` uniquement si appel côté navigateur ou attribution souhaitée. ([OpenRouter][4])
* Vérifier la prise en charge de `tools` par modèle (`supported_parameters`). ([OpenRouter][7])

---

## 5) E2B Desktop Sandbox — création et interaction

### 5.1 Création et streaming VNC

```ts
import { Sandbox } from '@e2b/desktop';

export const SANDBOX_TIMEOUT_MS = 5 * 60_000;

export async function createDesktop(resolution: [number, number]) {
  const desktop = await Sandbox.create({ resolution, dpi: 96, timeoutMs: SANDBOX_TIMEOUT_MS });
  await desktop.stream.start();
  const vncUrl = desktop.stream.getUrl(); // partager au client pour affichage
  desktop.setTimeout(SANDBOX_TIMEOUT_MS);
  return { desktop, vncUrl };
}
```

API `Sandbox.create`, `stream.start()`, `stream.getUrl()` et SDK Desktop documentés par E2B. ([e2b.dev][8])

### 5.2 Patron d’outil relié à E2B

```ts
let activeDesktop: Sandbox | undefined;

async function ensureDesktop() {
  if (!activeDesktop) {
    const { desktop } = await createDesktop([1366, 768]);
    activeDesktop = desktop;
  }
  return activeDesktop!;
}

export async function openUrlInE2B(url: string) {
  const desktop = await ensureDesktop();
  // Exemple: ouvrir un navigateur via lanceur / raccourci préinstallé.
  // Selon l'image Desktop, utilisez un script ou un utilitaire déjà présent.
  // Ici on publie surtout l'URL VNC au client, l'ouverture du site peut être
  // pilotée par votre couche d'automatisation (clic/keyboard).
  return { ok: true, vncUrl: desktop.stream.getUrl(), opened: url };
}
```

Notes:

* E2B Desktop fournit un **ordinateur isolé** prêt pour « Computer Use ». Le SDK JS/Python sert à démarrer/contrôler des sandboxes. Intégrez vos primitives d’automatisation (clic, clavier) selon votre image de base. ([e2b.dev][9], [GitHub][10])
* Latence et diffusion: E2B évolue vers VNC faible latence. Tenez compte des limites de flux et du *single client* selon l’implémentation. ([e2b.dev][11])
* Nettoyage: ajustez `timeoutMs`, détruisez les sandboxes inactifs.

---

## 6) LiteLLM Proxy — passerelle OpenAI-compatible

### 6.1 Démarrage

* LiteLLM fournit un **gateway** OpenAI-compatible qui unifie de multiples providers. ([docs.litellm.ai][2])
* Lancez le proxy (cf. docs « Proxy Server ») et configurez les clés providers dans l’env/proxy. ([docs.litellm.ai][12])

### 6.2 Appels via le proxy

```bash
# Exemple curl vers votre proxy local
curl -s http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",  // ou `litellm_proxy/your-model-name` selon config
    "messages": [{"role": "user", "content": "Hello from LiteLLM"}],
    "tools": [],
    "tool_choice": "auto"
  }'
```

```ts
// TS: pointer OPENAI_BASE_URL vers LiteLLM Proxy
const r = await fetch('http://localhost:4000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LITELLM_API_KEY!}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ model: 'gpt-4o-mini', messages, tools })
});
```

Le proxy parle le **même** schéma OpenAI, y compris tool calling et streaming, et peut router des providers hétérogènes. ([docs.litellm.ai][2])

---

## 7) Streaming SSE côté client

```ts
// Client: lire un flux SSE renvoyé par /api/chat
const resp = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages, stream: true }) });
const reader = resp.body!.getReader();
const decoder = new TextDecoder();

let buffer = '';
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  const events = buffer.split('\n\n');
  buffer = events.pop() || '';

  for (const evt of events) {
    if (!evt.startsWith('data:')) continue;
    const json = JSON.parse(evt.slice(5));
    // Traiter `role`, `content`, `tool_calls`, etc.
  }
}
```

Format SSE standard supporté par OpenRouter quand `stream: true`. ([OpenRouter][6])

---

## 8) Modèles, capacités et compatibilité

* Vérifiez la prise en charge de `tools`, `tool_choice`, `json_mode`, etc., par modèle via `supported_parameters`. ([OpenRouter][7])
* OpenRouter expose aussi des modèles OpenAI via interface compatible. ([OpenRouter][13])

---

## 9) Sécurité, tests, debugging

* Ne jamais exposer `OPENROUTER_API_KEY` côté client.
* Test hors app:

  * `GET /models` doit renvoyer `200`. ([OpenRouter][1])
* Erreurs usuelles:

  * `401` → clé absente/révoquée ou non transmise (header manquant). ([OpenRouter][1])
* Attribution: ajoutez `HTTP-Referer` et `X-Title` si vous voulez suivre votre app dans le ranking OpenRouter. ([OpenRouter][4])

---

## 10) Exemple complet — chaîne LLM → Tool → E2B → LLM

```ts
// /api/agent/route.ts
export const runtime = 'nodejs';

const tools = [{
  type: 'function',
  function: {
    name: 'open_url_in_sandbox',
    description: 'Open a URL in the active E2B desktop and return VNC URL.',
    parameters: { type: 'object', properties: { url: { type: 'string' }}, required: ['url'] }
  }
}];

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1) Premier appel — laisser le modèle décider d’appeler l’outil
  let r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'openrouter/auto', messages, tools })
  });
  let j = await r.json();

  const calls = j.choices?.[0]?.message?.tool_calls ?? [];
  if (calls.length) {
    // 2) Exécuter les tools côté serveur
    const toolMsgs = [];
    for (const c of calls) {
      const args = JSON.parse(c.function.arguments || '{}');
      if (c.function.name === 'open_url_in_sandbox') {
        const out = await openUrlInE2B(args.url);
        toolMsgs.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(out) });
      }
    }

    // 3) Second appel — formatter la réponse finale avec les sorties des tools
    r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [...messages, j.choices[0].message, ...toolMsgs]
      })
    });
    j = await r.json();
  }

  return Response.json(j);
}
```

Processus fidèle au modèle standardisé par OpenRouter pour tool calling. ([OpenRouter][5])

---

## 11) Check-list d’intégration

* [ ] Variables d’env: `OPENROUTER_API_KEY`, `APP_URL`, `APP_NAME`, `LITELLM_API_KEY`. ([OpenRouter][3], [docs.litellm.ai][2])
* [ ] Endpoint serveur Node (pas Edge) pour cacher la clé.
* [ ] SSE activé (`stream: true`) si nécessaire. ([OpenRouter][6])
* [ ] Outils déclarés (`tools`) et boucle tool-execution. ([OpenRouter][5])
* [ ] E2B Desktop: création sandbox, `stream.start()`, `getUrl()`, timeouts. ([e2b.dev][8])
* [ ] LiteLLM Proxy démarré si vous voulez unifier des providers. ([docs.litellm.ai][2])

---

## Références

* OpenRouter API overview, chat completions, quickstart, tool calling, models params, attribution. ([OpenRouter][1])
* E2B Desktop SDK et docs générales. ([e2b.dev][8])
* LiteLLM Proxy / OpenAI-compatible. ([docs.litellm.ai][2])

---

Fin.

[1]: https://openrouter.ai/docs/api-reference/overview?utm_source=chatgpt.com "OpenRouter API Reference | Complete API Documentation"
[2]: https://docs.litellm.ai/docs/providers/litellm_proxy?utm_source=chatgpt.com "LiteLLM Proxy (LLM Gateway)"
[3]: https://openrouter.ai/docs/quickstart?utm_source=chatgpt.com "OpenRouter Quickstart Guide | Developer Documentation"
[4]: https://openrouter.ai/docs/app-attribution?utm_source=chatgpt.com "App Attribution | OpenRouter Documentation"
[5]: https://openrouter.ai/docs/features/tool-calling?utm_source=chatgpt.com "Tool & Function Calling | Use Tools with OpenRouter"
[6]: https://openrouter.ai/docs/api-reference/chat-completion?utm_source=chatgpt.com "Chat completion | OpenRouter | Documentation"
[7]: https://openrouter.ai/docs/models?utm_source=chatgpt.com "Access 400+ AI Models Through One API - OpenRouter"
[8]: https://e2b.dev/docs/sdk-reference/desktop-js-sdk/v1.1.1/sandbox?utm_source=chatgpt.com "E2B - Code Interpreting for AI apps"
[9]: https://e2b.dev/docs?utm_source=chatgpt.com "E2B - Code Interpreting for AI apps"
[10]: https://github.com/e2b-dev/desktop?utm_source=chatgpt.com "e2b-dev/desktop: E2B Desktop Sandbox for LLMs. ..."
[11]: https://e2b.dev/blog/how-i-taught-an-ai-to-use-a-computer?utm_source=chatgpt.com "How I taught an AI to use a computer"
[12]: https://docs.litellm.ai/docs/proxy_server?utm_source=chatgpt.com "[OLD PROXY 👉 NEW proxy here] Local LiteLLM Proxy Server"
[13]: https://openrouter.ai/provider/openai?utm_source=chatgpt.com "OpenAI - OpenRouter"
