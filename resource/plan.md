Voici le plan de développement complet pour construire Project Apex à partir d'une page blanche.

Vision & Architecture Cible
(La vision reste inchangée, c'est notre étoile polaire)
Produit : Un assistant conversationnel augmenté, capable de discuter, de comprendre quand une tâche informatique est nécessaire, et de déployer un agent autonome dans un environnement cloud sécurisé (E2B) pour l'exécuter.
Architecture : Modulaire, basée sur des fournisseurs ("Providers"), avec une séparation claire entre le Chat Dispatcher (conversation) et le Task Orchestrator (action).

Parfait. C'est une décision courageuse et, à mon avis, la meilleure pour atteindre votre objectif de maîtrise totale et d'architecture impeccable. Partir de zéro nous libère de toutes les contraintes du code existant et nous permet de construire chaque brique exactement comme nous le voulons.

Notre objectif reste le même, mais notre approche sera plus pure. Nous allons construire Apex brique par brique, en nous assurant que chaque pièce est modulaire, testable et parfaitement adaptée à notre vision.

Voici le plan de développement complet pour construire **Project Apex à partir d'une page blanche**.

---

### **Vision & Architecture Cible**

*(La vision reste inchangée, c'est notre étoile polaire)*

*   **Produit :** Un assistant conversationnel augmenté, capable de discuter, de comprendre quand une tâche informatique est nécessaire, et de déployer un agent autonome dans un environnement cloud sécurisé (E2B) pour l'exécuter.
*   **Architecture :** Modulaire, basée sur des fournisseurs ("Providers"), avec une séparation claire entre le Chat Dispatcher (conversation) et le Task Orchestrator (action).

---

### **Phase 0 : Le Squelette et le Premier Souffle (Hello, World!)**

**Objectif Global :** Avoir un projet Next.js minimaliste mais fonctionnel, avec un backend qui peut répondre "pong" quand le frontend lui dit "ping". C'est l'étape la plus simple, mais la plus fondamentale.

*   **Tâche 0.1 : Initialisation du Projet**
    *   **Objectif :** Créer un nouveau projet Next.js propre.
    *   **Description :**
        1.  Ouvrir le terminal et exécuter `npx create-next-app@latest project-apex`.
        2.  Choisir les options : TypeScript, Tailwind CSS, App Router.
        3.  Nettoyer la page d'accueil par défaut (`app/page.tsx`) pour n'afficher qu'un simple "Hello, Apex!".
    *   **Requis :** Node.js, npm/yarn.

*   **Tâche 0.2 : Création de l'API de Test**
    *   **Objectif :** Établir la communication entre le frontend et le backend.
    *   **Description :**
        1.  Créer la route `app/api/ping/route.ts`.
        2.  Dans cette route, écrire une fonction `POST` qui retourne une réponse JSON `{ "message": "pong" }`.
    *   **Requis :** Projet Next.js.

*   **Tâche 0.3 : Interface de Chat Minimale**
    *   **Objectif :** Construire l'interface visuelle de base pour la conversation.
    *   **Description :**
        1.  Dans `app/page.tsx`, créer un composant simple qui a :
            *   Un état pour stocker une liste de messages (`useState<Message[]>`).
            *   Un état pour la zone de saisie (`useState<string>`).
            *   Une fonction qui, à l'envoi du formulaire, appelle notre API `/api/ping`.
        2.  Afficher la liste des messages.
    *   **Requis :** React (useState, useEffect).

**Résultat de la Phase 0 :** Une application web qui ne fait presque rien, mais où toutes les pièces de base sont en place et communiquent. On peut envoyer un message et recevoir une réponse du serveur.

---

### **Phase 1 : Le Cerveau Conversationnel**

**Objectif Global :** Transformer notre squelette en un chatbot intelligent, capable de comprendre l'intention de l'utilisateur et de proposer des actions.

*   **Tâche 1.1 : La Couche d'Abstraction des Fournisseurs (Providers)**
    *   **Objectif :** Construire la fondation modulaire pour tous nos futurs modèles.
    *   **Description :**
        1.  Créer le répertoire `/lib/providers` et `/lib/types`.
        2.  Définir l'interface `ILlmProvider` dans `lib/types/providers.d.ts`.
        3.  Implémenter la classe `LlamaCppProvider` qui respecte cette interface, en utilisant les variables d'environnement pour l'URL de l'API.

*   **Tâche 1.2 : Le Chat Dispatcher**
    *   **Objectif :** Coder la logique centrale de l'assistant.
    *   **Description :**
        1.  Créer le fichier `/lib/chat/ChatDispatcher.ts`.
        2.  Écrire la classe `ChatDispatcher` qui utilise une instance du `LlamaCppProvider`.
        3.  Écrire le **prompt système** crucial qui définit les règles de conversation et le format JSON pour la suggestion d'agent.

*   **Tâche 1.3 : Activer l'API de Chat**
    *   **Objectif :** Remplacer notre API "ping-pong" par une véritable API d'IA.
    *   **Description :**
        1.  Créer la route `/app/api/chat/route.ts`.
        2.  Cette route instancie le `ChatDispatcher` et utilise sa méthode `processMessage`.
        3.  Elle gère les deux types de réponses (texte normal ou suggestion d'agent JSON).

*   **Tâche 1.4 : Connecter l'UI au Cerveau**
    *   **Objectif :** Rendre l'interface de chat pleinement fonctionnelle.
    *   **Description :** Modifier la fonction d'envoi de message dans `app/page.tsx` pour qu'elle appelle `/api/chat`. L'UI doit pouvoir afficher un simple message texte ou un message avec un bouton "Lancer la Tâche" si elle reçoit une suggestion d'agent.

**Résultat de la Phase 1 :** Nous avons un assistant conversationnel SOTA, entièrement modulaire. Il peut discuter et sait quand proposer de passer à l'action.

---

### **Phase 2 : Le Déploiement de l'Agent Autonome**

**Objectif Global :** Donner vie au "Mode Agent". Quand l'utilisateur clique sur "Lancer la Tâche", un environnement sécurisé est créé et l'agent commence à travailler.

*   **Tâche 2.1 : Service de Gestion E2B**
    *   **Objectif :** Isoler toute la logique E2B dans un service dédié.
    *   **Description :** Créer `/lib/services/E2bService.ts`. Cette classe gérera tout le cycle de vie : `startSandbox()`, `stopSandbox()`, `takeScreenshot()`, `runCode()`.

*   **Tâche 2.2 : L'Architecture de l'Agent (Squelette)**
    *   **Objectif :** Mettre en place la structure hiérarchique de l'agent.
    *   **Description :**
        1.  Créer les fichiers pour les rôles : `/lib/agent/roles/Orchestrator.ts`, `Programmer.ts`, `GuiOperator.ts`.
        2.  Écrire les prompts système pour chacun d'eux.
        3.  Créer le fichier `/lib/agent/TaskOrchestrator.ts`. Il contiendra la logique de la boucle principale, mais pour l'instant, elle sera vide.

*   **Tâche 2.3 : Les API du Cycle de Vie de l'Agent**
    *   **Objectif :** Créer les endpoints pour contrôler l'agent depuis le frontend.
    *   **Description :**
        1.  Créer `/app/api/agent/start/route.ts` : il reçoit une description de tâche, appelle `E2bService.startSandbox()`, puis lance le `TaskOrchestrator` de manière asynchrone.
        2.  Créer `/app/api/agent/stream/route.ts` : met en place la connexion SSE pour que le `TaskOrchestrator` puisse envoyer des mises à jour.
        3.  Créer `/app/api/agent/stop/route.ts` : appelle `E2bService.stopSandbox()`.

*   **Tâche 2.4 : L'Interface du Mode Agent**
    *   **Objectif :** Créer la vue que l'utilisateur voit lorsque l'agent est actif.
    *   **Description :**
        1.  Créer le composant `AgentDashboard.tsx`.
        2.  Dans `app/page.tsx`, ajouter une gestion d'état pour basculer entre la vue "Chat" et la vue "Agent".
        3.  Quand le bouton "Lancer la Tâche" est cliqué, appeler `/api/agent/start` et basculer l'UI pour afficher le `AgentDashboard`.
        4.  Le `AgentDashboard` se connecte au flux SSE pour recevoir les mises à jour et les afficher (pour l'instant, juste des logs de test).

**Résultat de la Phase 2 :** L'architecture complète est en place. Cliquer sur "Lancer la Tâche" démarre un sandbox E2B et une boucle d'agent (qui ne fait encore rien d'intelligent), et l'UI bascule correctement.

---

### **Phase 3 : L'Exécution Intelligente**

**Objectif Global :** Rendre l'agent réellement capable d'accomplir des tâches en implémentant la logique CoAct-1.

*   **Tâche 3.1 : Implémentation de la Boucle du `TaskOrchestrator`**
    *   **Objectif :** Coder la logique de décision et de délégation.
    *   **Description :** Remplir la classe `TaskOrchestrator`. C'est la boucle principale : `Orchestrator.decide()` -> `(Programmer.generateCode() | GuiOperator.generateAction())` -> `E2bService.execute()` -> `Feedback`.

*   **Tâche 3.2 : Le Service de Grounding et les Experts**
    *   **Objectif :** Permettre au GUI Operator d'agir avec précision.
    *   **Description :**
        1.  Créer le `/lib/services/GroundingService.ts`.
        2.  Y intégrer notre `TesseractProvider`.
        3.  Modifier le `GuiOperator` pour qu'il utilise ce service avant de générer une action de clic.

*   **Tâche 3.3 : Amélioration de l'Interface de Supervision**
    *   **Objectif :** Afficher de manière claire ce que l'agent pense et fait.
    *   **Description :** Construire les composants `PlanViewer.tsx` et `ActionLog.tsx` et les connecter aux événements SSE émis par le `TaskOrchestrator`.

**Résultat de la Phase 3 :** Apex est maintenant un agent pleinement fonctionnel et de classe mondiale. Il peut planifier, choisir entre le code et l'interface graphique, et exécuter des tâches complexes de manière fiable.

---

### **Phase 4 : L'Apprentissage et la Pérennité (Le Data Flywheel)**

*(Cette phase est continue et commence une fois que le produit est stable)*

*   **Tâche 4.1 : Infrastructure de Données**
*   **Tâche 4.2 : Studio d'Annotation**
*   **Tâche 4.3 : Pipeline de Fine-Tuning**

**Résultat de la Phase 4 :** Apex n'est plus seulement un produit, mais une plateforme d'IA qui s'améliore à chaque interaction, assurant sa position de leader sur le long terme.

Ce plan est notre guide. Il est structuré, modulaire et ambitieux. En le suivant pas à pas, nous construirons une application exceptionnelle. Commençons par la **Tâche 0.1**.