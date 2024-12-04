import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { fs } from '@/wailsjs/wailsjs/go/models';
import { EventsOff, EventsOn } from '@/wailsjs/wailsjs/runtime/runtime';
import { toast } from 'sonner';

const SearchInput = ({ value, onChange }: {
  value: string;
  onChange: (value: string) => void
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      className="pl-9 w-full p-2 border rounded-xl"
    />
  </div>
);

const DirectoryList = ({ dirs, dirName }: { dirs: fs.ModFolder[], dirName: string | null }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getImageSrc = (index: number) => {
    if (index === 0) return '/top.jpg';
    if (index === dirs.length - 1) return '/bottom.jpg';
    return '/center.jpg';
  };

  const filteredDirs = dirs.filter(dir =>
    dir.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedIndex = filteredDirs.findIndex(dir => dir.Name === dirName);

  const ITEM_PADDING = 8;
  const ITEM_HEIGHT = 64;
  const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_PADDING;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 overflow-x-hidden">
        <div className="relative">
          {dirName && selectedIndex !== -1 && (
            <motion.div
              className="absolute left-0 right-0 bg-black/20 dark:bg-white/20 rounded"
              initial={false}
              animate={{
                y: selectedIndex * TOTAL_ITEM_HEIGHT,
                height: TOTAL_ITEM_HEIGHT
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 50
              }}
            />
          )}

          {filteredDirs.map((dir, index) => (
            <Link
              key={dir.Name}
              href={`/mod?dirname=${dir.Name}&dirpath=${dir.Path}`}
              style={{ height: TOTAL_ITEM_HEIGHT }}
              className={cn(
                "w-full text-left p-2 rounded flex items-center gap-2",
                "relative z-10 truncate font-semibold text-base",
                dirName === dir.Name && "text-accent-foreground"
              )}
            >
              <img
                className="rounded-none"
                alt="directory icon"
                src={getImageSrc(index)}
                width={64}
                height={64}
              />
              <span className="truncate">{dir.Name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectoryList;