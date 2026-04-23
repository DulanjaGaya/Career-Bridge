export default function FeatureBridge({ title, module, url, note }) {
  return (
    <section className="panel">
      <div className="bridge-head">
        <div>
          <h2>{title}</h2>
          <p>
            Module {module} feature is connected here.
            {note ? ` ${note}` : ""}
          </p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="btn ghost">
          Open standalone
        </a>
      </div>
      <iframe title={title} src={url} className="bridge-frame" />
    </section>
  );
}
