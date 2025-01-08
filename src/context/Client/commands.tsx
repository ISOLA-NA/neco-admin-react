// ProjectContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FormEvent,
} from "react";
import AppServices from "../../services/api.services";

interface CommandContextType {
  command: string;
  handleSetCommand: (command: string) => void;
  handleCommandDecorations: (e: FormEvent<HTMLFormElement>) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

interface CommandProviderProps {
  children: ReactNode;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({
  children,
}) => {
  const [command, setCommand] = useState<string>("");
  const handleSetCommand = (command: string) => {
    setCommand(command);
    console.log(command);
  };

  const handleCommandDecorations = (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (command.trim() === "") return;
    let cmd = command.toLowerCase().replace("necopm:\\", "");
    if (cmd.startsWith("ncmd")) {
      cmd = cmd.replace("ncmd\\", "");
      console.log("NCMD", cmd);
    } else {
      console.log("CMD", cmd);
    }
  };

  useEffect(() => {
    handleCommandDecorations();
  }, [command]);
  return (
    <CommandContext.Provider
      value={{ command, handleSetCommand, handleCommandDecorations }}
    >
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = (): CommandContextType => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useProject must be used within an CommandProvider");
  }
  return context;
};
