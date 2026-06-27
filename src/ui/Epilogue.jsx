// Graded ending screen. The ending object is produced entirely by endgame.js from
// final state; this component only presents it.
export default function Epilogue({ ending, onNewGame }) {
  if (!ending) return null;
  return (
    <div className="epilogue">
      <div className={'epilogue-card ' + ending.kind}>
        <div className="epilogue-grade">Grade: {ending.grade}</div>
        <h1>{ending.title}</h1>
        <p className="epilogue-body">{ending.body}</p>
        <button type="button" className="primary" onClick={onNewGame}>
          Begin Again — March 1861
        </button>
      </div>
    </div>
  );
}
