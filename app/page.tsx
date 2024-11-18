import GameCanvas from "../components/GameCanvas";
import "../styles/game.css";

export default function Home() {
  return (
    <>
      <div id="scoreboard"></div>
      <GameCanvas />
    </>
  );
}
