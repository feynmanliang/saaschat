export type Rec = {
  logo: string,
  pros: string,
  cons: string
  rank: number,
};

type RecCardProps = Rec & {
  onClear: () => void
};

function RecCard(p: RecCardProps) {
  return (
    <div className="card card-side bg-base-100 shadow-xl">
      <figure class="min-w-[100px]"><img className="logo" src={p.logo} /></figure>
      <div className="rank">
        {p.rank}
      </div>
      <div className="card-body">
        <h1>{p.name}</h1>

        <div>pros</div>
        <p>
          {p.pros}
        </p>
        <div>cons</div>
        <p>
          {p.cons}
        </p>
        {/*<div className="card-actions justify-end">
          <button onClick={p.onClear} className="btn btn-primary">Clear</button>
        </div>*/}
      </div>
    </div>
  );
}

type RecProps = {
  recs: Rec[];
  onClear: (r: Rec) => void
};
export default function Recs(p: RecProps) {
  return (
    <div className="rec-container">
      {p.recs.sort((a, b) => b.rank - a.rank).map((r, i) => <RecCard
        {...r}
        onClear={p.onClear}
      />
      )}
    </div>
  );
}