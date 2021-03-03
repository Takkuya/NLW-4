import Head from "next/head";
import { GetServerSideProps } from "next";

import { Profile } from "../components/Profile";
import { ExperienceBar } from "../components/ExperienceBar";
import { CompletedChallenges } from "../components/CompletedChallenges";
import { Countdown } from "../components/Countdown";
import { ChallengeBox } from "../components/ChallengeBox";

import styles from "../styles/pages/Home.module.css";
import { CountdownProvider } from "../contexts/CountdownContext";
import { ChallengesProvider } from "../contexts/ChallengesContext";

interface HomeProps {
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export default function Home(props: HomeProps) {
  return (
    //Passei o challenges provider aqui, pois as informações de nível, experiência, etc, estão sendo salvas nos cookies
    <ChallengesProvider
      level={props.level}
      currentExperience={props.currentExperience}
      challengesCompleted={props.challengesCompleted}
    >
      <div className={styles.container}>
        <Head>
          <title>Início | MoveIt</title>
        </Head>

        <ExperienceBar />

        {/* CountdownProvider fica dentro do ChallengesProvider pois ele depende  */}
        {/* Entretanto, esse provider não vai ser utilizado no app inteiro, desse modo posso colocar ele em volta dos elentos que usam ele, no caso aqui o countdown e o challenge box */}
        <CountdownProvider>
          <section>
            <div>
              <Profile />
              <CompletedChallenges />
              <Countdown />
            </div>
            <div>
              <ChallengeBox />
            </div>
          </section>
        </CountdownProvider>
      </div>
    </ChallengesProvider>
  );
}

//Com essa função eu consigo manipuplar quais dados são passados do Next para o React, tudo que eu faço aqui é executado no node, mesmo se desativarmos o JavaScript da página, ainda sim vamos conseguir visualizar essas informações
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { level, currentExperience, challengesCompleted } = ctx.req.cookies;

  return {
    props: {
      //Convertendo para número pois essa informações vem pelo tipo String através dos cookies
      level: Number(level),
      currentExperience: Number(currentExperience),
      challengesCompleted: Number(challengesCompleted),
    },
  };
};
