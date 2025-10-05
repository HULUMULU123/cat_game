import React, { createContext, useContext } from "react";
import { useGLTF } from "@react-three/drei";

interface ModelContextType {
  room: ReturnType<typeof useGLTF>;
  environment: string;
}

const ModelContext = createContext<ModelContextType | null>(null);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const room = useGLTF("/models/stakan_room.glb");
  const environment = "city";

  return (
    <ModelContext.Provider value={{ room, environment }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) throw new Error("useModel must be used inside ModelProvider");
  return context;
};
