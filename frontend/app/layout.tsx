'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { PlayIcon, RocketIcon, RotateCcwIcon, SettingsIcon } from 'lucide-react'
import { ThemeProvider } from './providers'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { type ReactNode, Suspense, useEffect } from 'react'
import { EventsOff, EventsOn } from '@/wailsjs/wailsjs/runtime/runtime'
import { GetModFolders, GetModRootPath, StartWatchingMods } from '@/wailsjs/wailsjs/go/main/App'
import { useModsStore } from '@/stores/useModsStore'
import AlertDialogComponent from '@/components/AlertDialog'
import DirectoryList from "@/components/DirList";

const inter = Inter({ subsets: ['latin'] })

function RootLayoutInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const dirName = searchParams.get('dirname');
  const pathname = usePathname()
  const { dirs, isLoading, setDirs, setIsLoading } = useModsStore()

  const fetchMods = async () => {
    try {
      setIsLoading(true)
      if (await GetModRootPath()) {
        const modFolders = await GetModFolders()
        setDirs(modFolders)
      }
    } catch (error) {
      console.error('모드 폴더 가져오기 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeWatcher = async () => {
      try {
        await StartWatchingMods()
        await fetchMods()
      } catch (e: any) {
        console.error('감시자 초기화 실패:', e)
      }
    }

    initializeWatcher()
  }, [])

  useEffect(() => {
    try {
      EventsOn('mods-changed', () => {
        fetchMods()
      })

      EventsOn('watcher-error', (errorMessage) => {
        console.error('감시자 에러:', errorMessage)
      })

      return () => {
        EventsOff('mods-changed')
        EventsOff('watcher-error')
      }
    } catch {
      // Events 가 '/' 에서만 초기화되기 때문에 EventsOn 에러 발생시 '/' 로 이동
      location.href = '/'
    }
  }, []);

  return (
    <div className="h-screen flex">
      <aside className="flex flex-col w-64 flex-shrink-0">
        <div className="flex items-center p-2 gap-2">
          <input className='p-2 outline-none rounded-xl border'/>
          <button className="p-1">
            <RotateCcwIcon size={16}/>
          </button>
        </div>

        <div className="flex-grow overflow-x-hidden p-2 w-full">
          <DirectoryList dirs={dirs} dirName={dirName}/>
        </div>
        <ul className="mt-auto p-4 border-t">
          <li>
            <button className="w-full text-left p-2 rounded flex items-center gap-2">
              <PlayIcon size={16}/>
              Run 3DMigoto
            </button>
          </li>
          <li>
            <button className="w-full text-left p-2 rounded flex items-center gap-2">
              <RocketIcon size={16}/>
              Run launcher
            </button>
          </li>
          <li>
            <Link
              href="/settings"
              className={cn(
                "w-full text-left p-2 rounded flex items-center gap-2",
                pathname === "/settings" && "bg-black/20 dark:bg-white/20 text-accent-foreground"
              )}>
              <SettingsIcon size={16}/>
              Settings
            </Link>
          </li>
        </ul>
      </aside>
      <div className="p-4 w-full h-full">
        {children}
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
    <body className={inter.className}>
    <Toaster richColors position="bottom-center"/>
    <AlertDialogComponent/>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Suspense fallback={<div>로딩중...</div>}>
        <RootLayoutInner>{children}</RootLayoutInner>
      </Suspense>
    </ThemeProvider>
    </body>
    </html>
  )
}