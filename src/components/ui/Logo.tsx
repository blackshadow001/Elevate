import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

type BrandImageSize = "compact" | "default" | "large";

interface BrandImageProps {
  className?: string;
  size?: BrandImageSize;
  alt?: string;
  inverse?: boolean;
}

const imageSizes = {
  compact: "h-9 w-[117px]",
  default: "h-11 w-[143px]",
  large: "h-[59px] w-[191px]",
} as const;

/** Keep the approved wordmark at its original aspect ratio on every surface. */
export function BrandImage({ className = "", size = "default", alt = `${brand.name} logo`, inverse = false }: BrandImageProps) {
  return (
    <span className={`relative inline-block shrink-0 ${imageSizes[size]} ${className}`}>
      <Image src={brand.logoPath} alt={alt} width={1119} height={337} unoptimized className={`block h-full w-full object-contain ${inverse ? "brightness-0 invert" : ""}`} />
      {inverse && (
        <Image src={brand.logoPath} alt="" aria-hidden="true" width={1119} height={337} unoptimized className="absolute inset-0 h-full w-full object-contain [clip-path:inset(0_68%_0_0)]" />
      )}
    </span>
  );
}

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  inverse?: boolean;
  href?: string;
  size?: BrandImageSize;
}

export function Logo({ className = "", iconOnly = false, inverse = false, href = "/", size = "default" }: LogoProps) {
  const destination = href === "/control-center" ? "admin dashboard" : href === "/instructor" ? "instructor studio" : "home";
  return (
    <Link href={href} aria-label={`${brand.name} ${destination}`} className={`inline-flex items-center group select-none ${className}`}>
      <BrandImage size={iconOnly ? "compact" : size} alt="" inverse={inverse} className="transition-transform duration-200 group-hover:scale-105" />
    </Link>
  );
}
