import { Link } from 'react-router-dom';

import { copy } from '../content/zh-CN';

export function BrandHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label={copy.brand.home}>
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M7 24V8l9 10 9-10v16" stroke="currentColor" strokeLinejoin="round" />
            <circle cx="25" cy="24" r="2" fill="currentColor" />
          </svg>
        </span>
        <span className="brand__name">{copy.brand.name}</span>
        <span className="brand__tagline">{copy.brand.tagline}</span>
      </Link>
      <Link className="site-header__link" to="/">{copy.brand.navigation}<span aria-hidden="true"> ↗</span></Link>
    </header>
  );
}
