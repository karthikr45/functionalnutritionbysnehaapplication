interface Props {
  color?: string;
  bgColor?: string;
  flip?: boolean;
  variant?: 'wave' | 'curve' | 'tilt';
}

export default function WaveDivider({ color = '#ffffff', bgColor = 'transparent', flip = false, variant = 'wave' }: Props) {
  const paths: Record<string, string> = {
    wave: 'M0,64 C288,20 576,100 720,64 C864,28 1080,80 1440,48 L1440,0 L0,0 Z',
    curve: 'M0,96 Q720,0 1440,96 L1440,0 L0,0 Z',
    tilt: 'M0,64 L1440,0 L1440,0 L0,0 Z',
  };

  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}
      style={{ backgroundColor: bgColor, marginTop: flip ? 0 : -1, marginBottom: flip ? -1 : 0 }}
    >
      <svg
        className="w-full h-12 sm:h-16 lg:h-20"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={paths[variant]} fill={color} />
      </svg>
    </div>
  );
}
