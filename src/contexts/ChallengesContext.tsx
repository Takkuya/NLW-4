import { createContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import challenges from "../../challenges.json";
import LevelUpModal from "../components/LevelUpModal";

interface Challenge {
  //Pois só temos 2 valores dentro de type
  type: "body" | "eye";
  description: string;
  amount: Number;
}

interface ChallengesContextData {
  level: number;
  currentExperience: number;
  challengesCompleted: number;
  experienceToNextLevel: number;
  //Especificar o que temos dentro do objeto, ao invés de colocar apenas object
  activeChallenge: Challenge;
  //Função sem parâmetro e nenhum retorno
  levelUp: () => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
  //O children é um componente React, assim podemos usar o ReactNode
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

//Esse children é o conteúdo dentro do ChallengesProveider no _app.tsx, ...rest é o resto das propriedades, no acso level, currentExperience e challengesCompleted
export function ChallengesProvider({
  children,
  ...rest
}: ChallengesProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(
    rest.currentExperience ?? 0
  );
  const [challengesCompleted, setChallengesCompleted] = useState(
    rest.challengesCompleted ?? 0
  );

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

  //Cálculo para experiência baseado em potenciação
  const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

  //Quando passamos um array vazio como parâmetro ele só executa essa funçção uma única vez assim que o componente for exibido em tela
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  //Salvando cookies
  useEffect(() => {
    Cookies.set("level", String(level));
    Cookies.set("currentExperience", String(currentExperience));
    Cookies.set("challengesCompleted", String(challengesCompleted));
  }, [level, currentExperience, challengesCompleted]);

  function levelUp() {
    setLevel(level + 1);

    setIsLevelUpModalOpen(true);
  }

  function closeLevelUpModal() {
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenge() {
    //Math.random um número aleatorio entre 0 e 1, nesse caso um número aleatório multiplicado por x número (nesse caso challenges.length)
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio("/notification.mp3").play();

    if (Notification.permission === "granted") {
      new Notification("Novo desafio", {
        body: `Valendo ${challenge.amount}xp`,
      });
    }
  }

  function resetChallenge() {
    setActiveChallenge(null);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      //Retorna nada, a função não é chamada se o usuário não tem um desafio ativo
      return;
    }

    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel;
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1);
  }
  //Todos os elementos dentro do Provider vão ter acesso aos dados daquele contexto, já que é algo que está por volta de toda a aplicação
  //Value = valores do estado
  return (
    <ChallengesContext.Provider
      value={{
        level,
        currentExperience,
        challengesCompleted,
        experienceToNextLevel,
        activeChallenge,
        levelUp,
        startNewChallenge,
        resetChallenge,
        completeChallenge,
        closeLevelUpModal,
      }}
    >
      {children}
      {isLevelUpModalOpen && <LevelUpModal />}
    </ChallengesContext.Provider>
  );
}
