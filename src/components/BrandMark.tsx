type BrandAsset = 'icon-c' | 'symbol' | 'combomark';
type BrandVariant = 'color' | 'bw';

interface BrandMarkProps {
  asset?: BrandAsset;
  variant?: BrandVariant;
  size?: number;
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

const ASSET_PREFIX: Record<BrandAsset, string> = {
  'icon-c': 'icon-c',
  symbol: 'logo-symbol',
  combomark: 'logo-combomark',
};

export function BrandMark({
  asset = 'icon-c',
  variant = 'color',
  size = 48,
  className = '',
  alt = '',
  loading = 'lazy',
}: BrandMarkProps) {
  const src = `/assets/${ASSET_PREFIX[asset]}-${variant}.png`;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
      loading={loading}
      aria-hidden={!alt}
    />
  );
}
