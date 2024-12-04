'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GetCharMods, GetModRootPath } from '@/wailsjs/wailsjs/go/main/App'
import { fs } from '@/wailsjs/wailsjs/go/models';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ModPageContent() {
  const searchParams = useSearchParams()
  const dirName = searchParams.get('dirname')
  const [mods, setMods] = useState<fs.ModInfo[] | null>()
  const [rootPath, setRootPath] = useState('')

  useEffect(() => {
    async function getFullPath() {
      const modRootPath = await GetModRootPath()
      setRootPath(modRootPath)
      const separator = modRootPath.includes('\\') ? '\\' : '/'
      return modRootPath.endsWith(separator)
        ? modRootPath + dirName
        : modRootPath + separator + dirName
    }

    async function getCharMods() {
      const fullPath = await getFullPath()
      const charMods = await GetCharMods(fullPath);
      setMods(charMods)
    }

    getCharMods().catch((e: any) => {
      toast.error("에러남", e)
    })
  }, [dirName])

  const getImgURL = (imgPath: string) => {
    return 'http://localhost:24312/api/img?path=' + imgPath
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4">{dirName}</div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {mods && mods.map((mod) => (
            <div
              key={mod.Name}
              className={cn(
                "shadow hover:shadow-xl dark:shadow-none dark:hover:shadow-none",
                "rounded-2xl overflow-hidden relative duration-300 border",
                mod.Name.toLowerCase().startsWith('disabled') ? 'bg-red-500/50' : 'bg-green-500/50'
              )}
            >
              <div className="p-4">
                <div className="font-medium mb-2">
                  {mod.Name}
                </div>
                <div className="aspect-video">
                  {mod.Preview.Path && (
                    <img
                      src={getImgURL(mod.Preview.Path)}
                      alt={`Preview of ${mod.Name}`}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ModPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModPageContent/>
    </Suspense>
  )
}