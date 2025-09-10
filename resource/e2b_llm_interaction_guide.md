# E2B LLM Interaction Guide: A Technical Deep Dive

## 1. Introduction

This document provides a detailed technical guide to the E2B "Surf" project. It is intended for developers who want to understand the low-level mechanics of how a Large Language Model (LLM) can control a virtual desktop environment. We will dissect the code, focusing on sandbox state management, the LLM-to-action pipeline, and the real-time communication between the client and server.

E2B provides an open-source, isolated virtual computer in the cloud. This guide uses the "Surf" project as a practical example of how to leverage E2B for AI-powered computer automation.

## 2. Core Architecture & Workflow

The application's magic lies in a continuous loop between the LLM and the E2B sandbox, orchestrated by a Next.js backend.

1.  **Client Request**: The user sends a prompt from the frontend. This prompt, along with the current `sandboxId` (if one exists) and the screen resolution, is sent to the backend API endpoint `/api/chat`.
2.  **Sandbox Management**: The backend either creates a new sandbox or connects to the existing one using the `sandboxId`.
3.  **LLM Invocation**: The backend sends the user's prompt and an initial screenshot of the sandbox desktop to the LLM.
4.  **Action Generation**: The LLM analyzes the prompt and the screenshot and returns a specific action to perform (e.g., `click at (x, y)`, `type "hello world"`).
5.  **Action Execution**: The backend receives the action and translates it into a command for the `@e2b/desktop` SDK, which executes it in the sandbox.
6.  **Feedback Loop**: After the action is executed, the backend takes a new screenshot of the desktop.
7.  **State Update**: This new screenshot is sent back to the LLM as context for the next action. This loop continues until the LLM determines the task is complete.
8.  **Streaming**: Throughout this process, the backend streams events (LLM reasoning, actions, errors) back to the frontend in real-time.

## 3. Technical Deep Dive: Code & Concepts

### 3.1. Sandbox State Management & Lifecycle

The state of the user's session is maintained solely through the `sandboxId`. The backend is stateless; it either creates a sandbox or reconnects to an existing one on each API call.

#### Sandbox Creation (`e2b/app/api/chat/route.ts`)

When a request arrives at the `POST` function in `/api/chat/route.ts` without a `sandboxId`, a new sandbox is created.

```typescript
// e2b/app/api/chat/route.ts

// ...
let desktop: Sandbox | undefined;
let activeSandboxId = sandboxId;
let vncUrl: string | undefined;

try {
  if (!activeSandboxId) {
    // 1. A new sandbox is created with specified resolution and timeout.
    const newSandbox = await Sandbox.create({
      resolution,
      dpi: 96,
      timeoutMs: SANDBOX_TIMEOUT_MS,
    });

    // 2. The VNC stream is started to make it accessible to the client.
    await newSandbox.stream.start();

    // 3. The ID and VNC URL are captured to be sent back to the client.
    activeSandboxId = newSandbox.sandboxId;
    vncUrl = newSandbox.stream.getUrl();
    desktop = newSandbox;
  } else {
    // If a sandboxId exists, connect to it.
    desktop = await Sandbox.connect(activeSandboxId);
  }
// ...
```

The `newSandbox.sandboxId` and `newSandbox.stream.getUrl()` are then sent back to the frontend as the first event in the stream. The frontend stores these values in its state to be used for subsequent requests.

### 3.2. The LLM Interaction & Action Execution

This is the core of the agent's intelligence. The process is managed by a "streamer" class that handles the back-and-forth with the LLM.

#### The Streamer Factory (`e2b/app/api/chat/route.ts`)

The `StreamerFactory` is a crucial piece of the architecture that allows for a modular approach to integrating different LLMs. Based on the `model` parameter passed from the frontend, it instantiates the appropriate streamer class. This design makes it easy to extend the application with new LLM providers without altering the core logic of the API route. Each streamer class, such as `OpenAIComputerStreamer` or `GoogleComputerStreamer`, adheres to a common interface, ensuring that the API can interact with them in a consistent manner. This factory pattern is key to the application's flexibility and scalability.

```typescript
// e2b/app/api/chat/route.ts

class StreamerFactory {
  static getStreamer(
    model: ComputerModel,
    desktop: Sandbox,
    resolution: [number, number]
  ): ComputerInteractionStreamerFacade {
    const resolutionScaler = new ResolutionScaler(desktop, resolution);

    switch (model) {
      // ... cases for different models
      case "openai":
      default:
        return new OpenAIComputerStreamer(desktop, resolutionScaler);
    }
  }
}
```

#### The LLM-Sandbox Conversation Loop (`e2b/lib/streaming/openai.ts`)

The `stream` method in `OpenAIComputerStreamer` contains the main conversation loop.

```typescript
// e2b/lib/streaming/openai.ts

// ...
async *stream(
  props: ComputerInteractionStreamerFacadeStreamProps
): AsyncGenerator<SSEEvent<"openai">> {
  const { messages, signal } = props;

  try {
    const modelResolution = this.resolutionScaler.getScaledResolution();

    // This tool definition tells the LLM about the "computer" it can use,
    // including the screen resolution and operating system.
    const computerTool: Tool = {
      // @ts-ignore
      type: "computer_use_preview",
      display_width: modelResolution[0],
      display_height: modelResolution[1],
      // @ts-ignore
      environment: "linux",
    };

    // This is the first call to the LLM. It sends the user's message history
    // and an initial screenshot (implicitly handled by the API).
    let response = await this.openai.responses.create({
      model: "computer-use-preview",
      tools: [computerTool],
      input: [...(messages as ResponseInput)],
      truncation: "auto",
      instructions: this.instructions,
      reasoning: {
        effort: "medium",
        generate_summary: "concise",
      },
    });

    // This loop continues as long as the LLM returns actions to perform.
    while (true) {
      if (signal.aborted) {
        break;
      }

      // Filter the LLM's output to find the specific 'computer_call' action.
      const computerCalls = response.output.filter(
        (item) => item.type === "computer_call"
      );

      // If there are no computer actions, the LLM has finished the task.
      // We stream the final reasoning and a DONE event, then exit the loop.
      if (computerCalls.length === 0) {
        yield {
          type: SSEEventType.REASONING,
          content: response.output_text,
        };
        yield {
          type: SSEEventType.DONE,
        };
        break;
      }

      const computerCall = computerCalls[0];
      const action = computerCall.action;

      // Stream the LLM's reasoning for taking this action back to the frontend.
      const reasoningItems = response.output.filter(
        (item) => item.type === "message" && "content" in item
      );
      if (reasoningItems.length > 0 && "content" in reasoningItems[0]) {
        const content = reasoningItems[0].content;
        yield {
          type: SSEEventType.REASONING,
          content:
            reasoningItems[0].content[0].type === "output_text"
              ? reasoningItems[0].content[0].text
              : JSON.stringify(reasoningItems[0].content),
        };
      }

      // Stream the specific action to the frontend so the user can see what the agent is doing.
      yield {
        type: SSEEventType.ACTION,
        action,
      };

      // Execute the action in the E2B sandbox.
      await this.executeAction(action);

      // Notify the frontend that the action is complete.
      yield {
        type: SSEEventType.ACTION_COMPLETED,
      };

      // This is the crucial feedback step: take a new screenshot of the desktop *after* the action.
      const newScreenshotData = await this.resolutionScaler.takeScreenshot();
      const newScreenshotBase64 =
        Buffer.from(newScreenshotData).toString("base64");

      // Prepare the screenshot to be sent back to the LLM as the output of the tool call.
      const computerCallOutput: ResponseInputItem = {
        call_id: computerCall.call_id,
        type: "computer_call_output",
        output: {
          // @ts-ignore
          type: "input_image",
          image_url: `data:image/png;base64,${newScreenshotBase64}`,
        },
      };

      // Call the LLM again, providing the previous response ID to maintain context,
      // and the new screenshot as the result of the last action.
      response = await this.openai.responses.create({
        model: "computer-use-preview",
        previous_response_id: response.id,
        instructions: this.instructions,
        tools: [computerTool],
        input: [computerCallOutput],
        truncation: "auto",
        reasoning: {
          effort: "medium",
          generate_summary: "concise",
        },
      });
    }
  } catch (error) {
    // Handle errors
  }
}
```

#### Action Execution (`e2b/lib/streaming/openai.ts`)

The `executeAction` method is the bridge between the LLM's intent and the sandbox's execution. It's a critical mapping that translates the abstract action object from the LLM into a concrete function call using the `@e2b/desktop` SDK. This function is where the virtual "hands" of the agent move.

When the LLM decides to, for example, click on a button, it doesn't know how to programmatically perform a click. Instead, it returns a structured JSON object like `{ "type": "click", "x": 100, "y": 250 }`. The `executeAction` method receives this object and, using a `switch` statement, calls the corresponding `desktop.leftClick(100, 250)` method from the E2B SDK.

A crucial detail here is the `resolutionScaler`. The LLM sees a scaled-down version of the desktop to save on processing time and cost. The `resolutionScaler` ensures that the coordinates provided by the LLM are accurately translated back to the sandbox's full resolution, ensuring the click happens in the correct location. This process is repeated for every type of action, from typing text to pressing keys, providing a seamless translation from AI intent to desktop interaction.

```typescript
// e2b/lib/streaming/openai.ts

async executeAction(
  action: ResponseComputerToolCall["action"]
): Promise<ActionResponse | void> {
  const desktop = this.desktop;

  switch (action.type) {
    case "click": {
      // The coordinates from the LLM are scaled to the sandbox's original resolution.
      const coordinate = this.resolutionScaler.scaleToOriginalSpace([
        action.x,
        action.y,
      ]);
      await desktop.leftClick(coordinate[0], coordinate[1]);
      break;
    }
    case "type": {
      // Types the provided text into the active window.
      await desktop.write(action.text);
      break;
    }
    case "keypress": {
      // Presses a specific key or combination of keys (e.g., "Enter", "Ctrl+C").
      await desktop.press(action.keys);
      break;
    }
    // ... other actions like scroll, move, drag, etc.
  }
}
```

### 3.3. Frontend Communication (`e2b/app/page.tsx`)

The frontend uses the `useChat` custom hook to manage the state and communication with the backend. When the user submits a prompt, the `onSubmit` function calls `sendMessage`, which initiates the `fetch` request to the `/api/chat` endpoint.

```typescript
// e2b/app/page.tsx

const onSubmit = (e: React.FormEvent) => {
  const content = handleSubmit(e);
  if (content) {
    // Get the current resolution of the iframe to send to the LLM.
    // This ensures the LLM sees the desktop at the same size as the user.
    const width = iFrameWrapperRef.current?.clientWidth || 1024;
    const height = iFrameWrapperRef.current?.clientHeight || 768;

    sendMessage({
      content,
      sandboxId: sandboxId || undefined, // Send the current sandboxId to reconnect
      environment: "linux",
      resolution: [width, height],
    });
  }
};
```

The `useChat` hook handles the streaming response, parsing the Server-Sent Events (SSE) and updating the UI accordingly. When it receives a `SANDBOX_CREATED` event, it updates its internal state with the new `sandboxId` and `vncUrl`, ensuring that subsequent requests are sent to the same sandbox instance.

This detailed breakdown provides a clearer picture of the technical implementation, showing how sandbox state is managed, how the LLM interacts with the sandbox through a continuous feedback loop, and how the frontend communicates with the backend to create a real-time user experience.

### 3.4. The System Prompt: Guiding the LLM

The behavior of the LLM is heavily influenced by the system prompt, which is a set of instructions provided at the beginning of the conversation. This prompt sets the context for the LLM, defining its persona, capabilities, and constraints.

```typescript
// e2b/lib/streaming/openai.ts

const INSTRUCTIONS = `
You are Surf, a helpful assistant that can use a computer to help the user with their tasks.
You can use the computer to search the web, write code, and more.

Surf is built by E2B, which provides an open source isolated virtual computer in the cloud made for AI use cases.
This application integrates E2B's desktop sandbox with OpenAI's API to create an AI agent that can perform tasks
on a virtual computer through natural language instructions.

The screenshots that you receive are from a running sandbox instance, allowing you to see and interact with a real
virtual computer environment in real-time.

Since you are operating in a secure, isolated sandbox micro VM, you can execute most commands and operations without
worrying about security concerns. This environment is specifically designed for AI experimentation and task execution.

The sandbox is based on Ubuntu 22.04 and comes with many pre-installed applications including:
- Firefox browser
- Visual Studio Code
- LibreOffice suite
- Python 3 with common libraries
- Terminal with standard Linux utilities
- File manager (PCManFM)
- Text editor (Gedit)
- Calculator and other basic utilities

IMPORTANT: It is okay to run terminal commands at any point without confirmation, as long as they are required to fulfill the task the user has given. You should execute commands immediately when needed to complete the user's request efficiently.

IMPORTANT: When typing commands in the terminal, ALWAYS send a KEYPRESS ENTER action immediately after typing the command to execute it. Terminal commands will not run until you press Enter.

IMPORTANT: When editing files, prefer to use Visual Studio Code (VS Code) as it provides a better editing experience with syntax highlighting, code completion, and other helpful features.
`;
```

This prompt is crucial for ensuring that the LLM understands its role and how to interact with the sandbox. It provides information about the available tools, the security context, and important instructions for common tasks like using the terminal and editing files.
  // Initial call to the LLM with user messages
  let response = await this.openai.responses.create({ ... });

  while (true) {
    // 1. Check if the LLM returned a computer action.
    const computerCalls = response.output.filter(
      (item) => item.type === "computer_call"
    );

    // If no action, the task is done. Break the loop.
    if (computerCalls.length === 0) {
      yield { type: SSEEventType.REASONING, content: response.output_text };
      yield { type: SSEEventType.DONE };
      break;
    }

    const computerCall = computerCalls[0];
    const action = computerCall.action;

    // 2. Stream the action to the frontend for display.
    yield { type: SSEEventType.ACTION, action };

    // 3. Execute the action in the sandbox.
    await this.executeAction(action);

    yield { type: SSEEventType.ACTION_COMPLETED };

    // 4. Take a new screenshot as feedback for the LLM.
    const newScreenshotData = await this.resolutionScaler.takeScreenshot();
    const newScreenshotBase64 = Buffer.from(newScreenshotData).toString("base64");

    const computerCallOutput: ResponseInputItem = {
      call_id: computerCall.call_id,
      type: "computer_call_output",
      output: {
        type: "input_image",
        image_url: `data:image/png;base64,${newScreenshotBase64}`,
      },
    };

    // 5. Call the LLM again with the screenshot of the result.
    response = await this.openai.responses.create({
      // ...
      previous_response_id: response.id, // Maintains conversation context
      input: [computerCallOutput],       // Provides the new screenshot
    });
  }
}
// ...
```

#### Action Execution (`e2b/lib/streaming/openai.ts`)

The `executeAction` method is a simple but critical mapping between the LLM's desired action and the corresponding method in the `@e2b/desktop` SDK.

```typescript
// e2b/lib/streaming/openai.ts

async executeAction(
  action: ResponseComputerToolCall["action"]
): Promise<ActionResponse | void> {
  const desktop = this.desktop;

  switch (action.type) {
    case "click": {
      const coordinate = this.resolutionScaler.scaleToOriginalSpace([
        action.x,
        action.y,
      ]);
      await desktop.leftClick(coordinate[0], coordinate[1]);
      break;
    }
    case "type": {
      await desktop.write(action.text);
      break;
    }
    case "keypress": {
      await desktop.press(action.keys);
      break;
    }
    // ... other actions
  }
}
```

### 3.3. Frontend Communication (`e2b/app/page.tsx`)

The frontend uses the `useChat` custom hook to manage the state and communication with the backend.

When the user submits a prompt, the `onSubmit` function calls `sendMessage`.

```typescript
// e2b/app/page.tsx

const onSubmit = (e: React.FormEvent) => {
  const content = handleSubmit(e);
  if (content) {
    // Get the current resolution of the iframe to send to the LLM
    const width = iFrameWrapperRef.current?.clientWidth || 1024;
    const height = iFrameWrapperRef.current?.clientHeight || 768;

    sendMessage({
      content,
      sandboxId: sandboxId || undefined, // Send the current sandboxId
      environment: "linux",
      resolution: [width, height],
    });
  }
};
```

The `useChat` hook handles the streaming response, parsing the Server-Sent Events (SSE) and updating the UI accordingly. When it receives a `SANDBOX_CREATED` event, it updates its internal state with the new `sandboxId` and `vncUrl`.

This detailed breakdown provides a clearer picture of the technical implementation, showing how sandbox state is managed, how the LLM interacts with the sandbox through a continuous feedback loop, and how the frontend communicates with the backend to create a real-time user experience.
