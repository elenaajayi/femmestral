import { createBrowserRouter } from "react-router";
import { ChatsListScreen } from "./components/ChatsListScreen";
import { ChatScreen } from "./components/ChatScreen";
import { MisinfoDetectedScreen } from "./components/MisinfoDetectedScreen";
import { ForwardToAgentScreen } from "./components/ForwardToAgentScreen";
import { AgentChatScreen } from "./components/AgentChatScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ChatsListScreen,
  },
  {
    path: "/chat",
    Component: ChatScreen,
  },
  {
    path: "/misinfo-detected",
    Component: MisinfoDetectedScreen,
  },
  {
    path: "/forward-to-agent",
    Component: ForwardToAgentScreen,
  },
  {
    path: "/agent-chat",
    Component: AgentChatScreen,
  },
]);