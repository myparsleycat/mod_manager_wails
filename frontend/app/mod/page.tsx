'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GetCharMods, GetModRootPath } from '@/wailsjs/wailsjs/go/main/App'
import { fs } from '@/wailsjs/wailsjs/go/models';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getImgURL } from '@/utils';
import ModItem from '@/components/ModItem';
import { useAlertDialog } from "@/stores/useAlert";

function ModPageContent() {
  const searchParams = useSearchParams()
  const dirName = searchParams.get('dirname')
  const [mods, setMods] = useState<fs.ModInfo[] | null>()
  const { setAlert } = useAlertDialog();

  async function getFullPath() {
    const modRootPath = await GetModRootPath()
    const separator = modRootPath.includes('\\') ? '\\' : '/'
    return modRootPath.endsWith(separator)
      ? modRootPath + dirName
      : modRootPath + separator + dirName
  }

  async function getCharMods() {
    const fullPath = await getFullPath()
    const charMods = await GetCharMods(fullPath);

    if (!charMods) {
      setMods(null);
      return;
    }

    const sortedMods = [...charMods].sort((a, b) => {
      const nameA = a.Name.replace(/disabled\s*/gi, '').toLowerCase();
      const nameB = b.Name.replace(/disabled\s*/gi, '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setMods(sortedMods);
  }

  useEffect(() => {
    getCharMods()
      .catch((e: any) => {
        setAlert({
          title: '에러남',
          description: e.message
        })
      })
  }, [dirName])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4">
        {dirName}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {mods && mods.map((mod) => (
            <ModItem key={mod.Name} mod={mod} getCharMods={getCharMods} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ModPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModPageContent />
    </Suspense>
  )
}