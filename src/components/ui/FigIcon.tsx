interface FigIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export default function FigIcon({ 
  name, 
  size = 24, 
  color = "currentColor",
  className = ""
}: FigIconProps) {
  return (
    <img
      src={`/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ color }}
    />
  );
}