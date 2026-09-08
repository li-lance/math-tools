/** 卡片与详情页的静态数学示意，不加载案例运行时或 WebGL。 */
export function CaseArtwork({ geometry = false }: { geometry?: boolean }) {
  return (
    <div className={`case-artwork ${geometry ? 'case-artwork--geometry' : 'case-artwork--number'}`} aria-hidden="true">
      {geometry ? (
        <svg viewBox="0 0 480 280" fill="none">
          <g className="art-net" stroke="currentColor">
            <path d="M74 96h36v36H74zM74 132h36v36H74zM38 132h36v36H38zM110 132h36v36h-36zM74 168h36v36H74zM74 204h36v36H74z" />
          </g>
          <path d="M173 154h44m-9-7 9 7-9 7" className="art-line art-link" />
          <g className="art-solid" stroke="currentColor" strokeLinejoin="round">
            <path d="m313 54 86 50-86 50-86-50Z" className="art-top" />
            <path d="m227 104 86 50v99l-86-50Z" className="art-front" />
            <path d="m313 154 86-50v99l-86 50Z" className="art-side" />
          </g>
          <path d="M422 66v18m-9-9h18M202 218v12m-6-6h12" className="art-line" />
        </svg>
      ) : (
        <svg viewBox="0 0 480 280" fill="none">
          <path d="M52 163h376m-11-7 11 7-11 7" className="art-line" />
          {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
            <g key={n}>
              <path d={`M${78 + (n + 3) * 54} 156v14`} className="art-line" />
              <text x={78 + (n + 3) * 54} y="203" textAnchor="middle" className="art-label">{n}</text>
            </g>
          ))}
          <path d="M240 160c0-69 108-69 108-5m-7-9 7 10 7-10" className="art-arc" />
          <circle cx="348" cy="163" r="20" className="art-halo" />
          <circle cx="348" cy="163" r="12" className="art-dot" />
          <text x="292" y="107" textAnchor="middle" className="art-value">+2</text>
        </svg>
      )}
    </div>
  );
}
