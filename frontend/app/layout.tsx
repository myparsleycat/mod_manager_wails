'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { FolderIcon, PlayIcon, RocketIcon, RotateCcwIcon, SettingsIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ThemeProvider } from './providers'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { EventsOn, EventsOff } from '@/wailsjs/wailsjs/runtime/runtime'
import { GetModFolders, StartWatchingMods, GetModRootPath } from '@/wailsjs/wailsjs/go/main/App'
import { useModsStore } from '@/stores/useModsStore'
import AlertDialogComponent from '@/components/AlertDialog'
import { useAlertDialog } from '@/stores/useAlert'

const inter = Inter({ subsets: ['latin'] })

function RootLayoutInner({ children }: { children: React.ReactNode }) {
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

    EventsOn('mods-changed', () => {
      console.log('모드 변경 이벤트 수신됨')
      fetchMods()
    })

    EventsOn('watcher-error', (errorMessage) => {
      console.error('감시자 에러:', errorMessage)
    })

    return () => {
      EventsOff('mods-changed')
      EventsOff('watcher-error')
    }
  }, [])

  return (
    <div className="h-screen flex">
      <aside className="flex flex-col w-64 flex-shrink-0">
        <div className="flex items-center p-2 gap-2">
          <input className='p-2 outline-none rounded-xl border' />
          <button className="p-1">
            <RotateCcwIcon size={16} />
          </button>
        </div>

        <div className="flex-grow overflow-x-hidden p-2 w-full">
          {dirs && dirs.map((dir) => (
            <Link
              key={dir}
              href={`/mod?dirname=${dir}`}
              className={cn(
                "w-full text-left p-2 rounded flex items-center gap-2 font-semibold text-lg truncate",
                dirName === dir && "bg-accent text-accent-foreground"
              )}>
              <FolderIcon size={16} className="flex-shrink-0" />
              <span className="truncate">{dir}</span>
            </Link>
          ))}
        </div>
        <ul className="mt-auto p-4 border-t">
          <li>
            <button className="w-full text-left p-2 rounded flex items-center gap-2">
              <PlayIcon size={16} />
              Run 3d migoto
            </button>
          </li>
          <li>
            <button className="w-full text-left p-2 rounded flex items-center gap-2">
              <RocketIcon size={16} />
              Run launcher
            </button>
          </li>
          <li>
            <Link
              href="/settings"
              className={cn(
                "w-full text-left p-2 rounded flex items-center gap-2",
                pathname === "/settings" && "bg-accent text-accent-foreground"
              )}>
              <SettingsIcon size={16} />
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Toaster richColors position="bottom-center" />
        <AlertDialogComponent />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div>로딩중...</div>}>
            <RootLayoutInner>{children}</RootLayoutInner>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}