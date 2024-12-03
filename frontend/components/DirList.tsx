import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const DirectoryList = ({ dirs, dirName }: { dirs: string[], dirName: string | null }) => {
  const getImageSrc = (index: number) => {
    if (index === 0) return '/top.jpg';
    if (index === dirs.length - 1) return '/bottom.jpg';
    return '/center.jpg';
  };

  return (
    <>
      {dirs && dirs.map((dir, index) => (
        <Link
          key={dir}
          href={`/mod?dirname=${dir}`}
          className={cn(
            "w-full text-left p-1 rounded flex items-center gap-2 font-semibold text-base truncate",
            dirName === dir && "bg-black/20 dark:bg-white/20 text-accent-foreground"
          )}>
          <img
            className="rounded-none"
            alt="directory icon"
            src={getImageSrc(index)}
            width={64}
            height={64}
          />
          <span className="truncate">{dir}</span>
        </Link>
      ))}
    </>
  );
};

export default DirectoryList;